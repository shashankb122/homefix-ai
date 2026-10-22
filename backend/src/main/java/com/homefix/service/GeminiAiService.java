package com.homefix.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.homefix.entity.AiAnalysis;
import com.homefix.entity.RiskLevel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class GeminiAiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiAiService.class);

    private final String apiKey;
    private final String model;
    private final String endpoint;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final FileStorageService fileStorageService;

    public GeminiAiService(
            @Value("${app.gemini.api-key:}") String apiKey,
            @Value("${app.gemini.model:gemini-3.5-flash}") String model,
            @Value("${app.gemini.endpoint:https://generativelanguage.googleapis.com/v1beta/models}") String endpoint,
            FileStorageService fileStorageService) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = model != null ? model.trim() : "gemini-3.5-flash";
        this.endpoint = endpoint;
        this.fileStorageService = fileStorageService;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public boolean isAiConfigured() {
        return StringUtils.hasText(this.apiKey) && !this.apiKey.equalsIgnoreCase("YOUR_GEMINI_API_KEY");
    }

    public String getActiveModel() {
        return this.model;
    }

    public AiAnalysis analyzeRepair(String title, String issueDescription, String roomOrLocation, String imageFilename) {
        if (!isAiConfigured()) {
            logger.warn("Gemini API key is not configured. Returning unconfigured AI notification.");
            return createUnconfiguredAnalysis();
        }

        String systemPrompt = """
                You are HomeFix AI, a certified home repair safety assistant.
                Analyze the user's household problem description and optional photo.
                
                CRITICAL AI SAFETY DIRECTIVES:
                1. Treat image-based and textual findings strictly as possible explanations, NEVER as confirmed diagnoses.
                2. DO NOT suggest dangerous DIY procedures involving live electrical systems, gas lines/leaks, open flames/fire hazards, load-bearing structural damage, toxic mold, or high-pressure steam/water mains.
                3. For urgent hazards (sparks, gas smell, flooding near power, structural sagging), immediately classify riskLevel as "URGENT_HAZARD", set professionalRecommended to true, and instruct the user to evacuate the area and contact emergency services or licensed professionals.
                4. NEVER claim that AI replaces an on-site inspection by a licensed technician.
                5. You MUST respond ONLY with a single valid JSON object without markdown code blocks, matching this exact schema:
                {
                  "problemCategory": "Plumbing | Electrical | HVAC | Appliance | Structural | General",
                  "simpleSummary": "1-2 sentence plain-English explanation of the likely problem",
                  "riskLevel": "LOW | MEDIUM | HIGH | URGENT_HAZARD",
                  "possibleCauses": ["cause 1", "cause 2"],
                  "safeImmediateSteps": ["Safe step 1 (e.g. shut off valve, take clear photo)"],
                  "thingsNotToDo": ["Warning 1 (e.g. do not touch bare wires, do not use flame)"],
                  "professionalRecommended": true/false,
                  "followUpQuestions": ["Clarifying question to narrow down the issue"],
                  "confidenceNote": "Note describing limitations of AI remote assessment"
                }
                """;

        String userPrompt = "Household Problem: " + title + "\n"
                + "Location: " + (StringUtils.hasText(roomOrLocation) ? roomOrLocation : "Unspecified") + "\n"
                + "Detailed Description: " + issueDescription;

        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("text", systemPrompt + "\n\n" + userPrompt));

        if (StringUtils.hasText(imageFilename)) {
            try {
                String base64Data = fileStorageService.getFileAsBase64(imageFilename);
                String mimeType = fileStorageService.getContentType(imageFilename);
                parts.add(Map.of(
                        "inline_data", Map.of(
                                "mime_type", mimeType,
                                "data", base64Data
                        )
                ));
            } catch (Exception e) {
                logger.error("Failed to read image for Gemini: {}", imageFilename, e);
            }
        }

        Map<String, Object> contentsMap = Map.of("parts", parts);
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(contentsMap));

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("response_mime_type", "application/json");
        generationConfig.put("temperature", 0.2);
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // Models to try in order
        List<String> candidateModels = new ArrayList<>();
        candidateModels.add(this.model);
        if (!candidateModels.contains("gemini-3.5-flash")) candidateModels.add("gemini-3.5-flash");
        if (!candidateModels.contains("gemini-3.5-flash-lite")) candidateModels.add("gemini-3.5-flash-lite");
        if (!candidateModels.contains("gemini-flash-latest")) candidateModels.add("gemini-flash-latest");

        Exception lastException = null;

        for (String candidate : candidateModels) {
            String requestUrl = endpoint + "/" + candidate + ":generateContent?key=" + apiKey;
            try {
                logger.info("Calling Gemini API with model: {}", candidate);
                ResponseEntity<String> response = restTemplate.postForEntity(requestUrl, entity, String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    AiAnalysis analysis = parseGeminiResponse(response.getBody());
                    analysis.setLiveAiConfigured(true);
                    return analysis;
                }
            } catch (HttpStatusCodeException ex) {
                logger.warn("Gemini model {} returned status {}: {}", candidate, ex.getStatusCode(), ex.getResponseBodyAsString());
                lastException = ex;
                // If 404 (model not found) or 503 (demand spike), try next candidate
                if (ex.getStatusCode().value() == 404 || ex.getStatusCode().value() == 503) {
                    continue;
                }
                break;
            } catch (Exception e) {
                logger.warn("Gemini model {} failed: {}", candidate, e.getMessage());
                lastException = e;
            }
        }

        logger.error("All Gemini model attempts failed. Last error: {}", lastException != null ? lastException.getMessage() : "Unknown");
        AiAnalysis fallback = createUnconfiguredAnalysis();
        fallback.setLiveAiConfigured(true); // Key is configured, but upstream service error
        fallback.setProblemCategory("Plumbing / Household");
        fallback.setSimpleSummary("AI analysis temporarily could not reach Google Gemini. Please check connection or click Re-Run AI Analysis.");
        fallback.setConfidenceNote("Upstream Gemini notice: " + (lastException != null ? lastException.getMessage() : "Temporary service interruption"));
        return fallback;
    }

    private AiAnalysis parseGeminiResponse(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isEmpty()) {
                throw new RuntimeException("No candidates returned by Gemini");
            }

            JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
            String rawText = textNode.asText().trim();

            if (rawText.startsWith("```json")) {
                rawText = rawText.substring(7);
            }
            if (rawText.startsWith("```")) {
                rawText = rawText.substring(3);
            }
            if (rawText.endsWith("```")) {
                rawText = rawText.substring(0, rawText.length() - 3);
            }
            rawText = rawText.trim();

            JsonNode parsed = objectMapper.readTree(rawText);

            AiAnalysis analysis = new AiAnalysis();
            analysis.setProblemCategory(parsed.path("problemCategory").asText("General Household"));
            analysis.setSimpleSummary(parsed.path("simpleSummary").asText("Preliminary visual observation of household issue."));

            String riskStr = parsed.path("riskLevel").asText("LOW").toUpperCase();
            try {
                analysis.setRiskLevel(RiskLevel.valueOf(riskStr));
            } catch (Exception e) {
                analysis.setRiskLevel(RiskLevel.MEDIUM);
            }

            analysis.setPossibleCauses(jsonArrayToList(parsed.path("possibleCauses")));
            analysis.setSafeImmediateSteps(jsonArrayToList(parsed.path("safeImmediateSteps")));
            analysis.setThingsNotToDo(jsonArrayToList(parsed.path("thingsNotToDo")));
            analysis.setProfessionalRecommended(parsed.path("professionalRecommended").asBoolean(true));
            analysis.setFollowUpQuestions(jsonArrayToList(parsed.path("followUpQuestions")));
            analysis.setConfidenceNote(parsed.path("confidenceNote").asText("AI remote assessment. Always verify with an in-person qualified professional."));
            analysis.setLiveAiConfigured(true);
            analysis.setAnalyzedAt(LocalDateTime.now());

            return analysis;
        } catch (Exception e) {
            logger.error("Failed to parse Gemini response JSON", e);
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage(), e);
        }
    }

    private List<String> jsonArrayToList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode item : node) {
                if (StringUtils.hasText(item.asText())) {
                    list.add(item.asText());
                }
            }
        }
        return list;
    }

    public AiAnalysis createUnconfiguredAnalysis() {
        AiAnalysis analysis = new AiAnalysis();
        analysis.setProblemCategory("AI Offline / Unconfigured");
        analysis.setSimpleSummary("Live AI analysis is currently offline because GEMINI_API_KEY has not been configured in the backend environment.");
        analysis.setRiskLevel(RiskLevel.LOW);
        analysis.setPossibleCauses(List.of(
                "Backend started without a GEMINI_API_KEY environment variable.",
                "Google Gemini API integration is awaiting an active API key."
        ));
        analysis.setSafeImmediateSteps(List.of(
                "Document the issue with clear photos and written notes.",
                "If there is any water leak, turn off the nearest isolation valve.",
                "If you smell gas or see electrical sparks, keep away and call local emergency services immediately."
        ));
        analysis.setThingsNotToDo(List.of(
                "Do not attempt dangerous electrical, gas, or high-pressure plumbing repairs without professional licensing.",
                "Do not assume unverified online advice is safe for complex structural problems."
        ));
        analysis.setProfessionalRecommended(true);
        analysis.setFollowUpQuestions(List.of(
                "Have you obtained a free Gemini API key from Google AI Studio (https://aistudio.google.com)?",
                "Has GEMINI_API_KEY been added to your system environment variables or backend configuration?"
        ));
        analysis.setConfidenceNote("This is a system status advisory. To enable live Gemini AI diagnosis, configure GEMINI_API_KEY.");
        analysis.setLiveAiConfigured(false);
        analysis.setAnalyzedAt(LocalDateTime.now());
        return analysis;
    }
}
