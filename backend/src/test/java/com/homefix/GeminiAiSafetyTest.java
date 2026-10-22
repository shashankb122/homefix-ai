package com.homefix;

import com.homefix.entity.AiAnalysis;
import com.homefix.entity.RiskLevel;
import com.homefix.service.FileStorageService;
import com.homefix.service.GeminiAiService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class GeminiAiSafetyTest {

    @Test
    public void testUnconfiguredGeminiReturnsSafetyAdvisory() {
        FileStorageService realStorage = new FileStorageService("target/test-uploads", "image/jpeg,image/png,image/webp", 10485760);
        // Empty API key simulates fresh unconfigured environment
        GeminiAiService geminiAiService = new GeminiAiService("", "gemini-1.5-flash", "https://generativelanguage.googleapis.com/v1beta/models", realStorage);

        assertFalse(geminiAiService.isAiConfigured(), "Service should detect that Gemini is not configured");

        AiAnalysis analysis = geminiAiService.analyzeRepair(
                "Gas leak smell in utility closet",
                "Strong rotten egg odor coming from the water heater area.",
                "Basement",
                null
        );

        assertNotNull(analysis);
        assertFalse(analysis.isLiveAiConfigured());
        assertEquals("AI Offline / Unconfigured", analysis.getProblemCategory());
        assertTrue(analysis.isProfessionalRecommended(), "Should recommend professional help");
        assertNotNull(analysis.getSafeImmediateSteps());
        assertFalse(analysis.getSafeImmediateSteps().isEmpty());
        assertNotNull(analysis.getThingsNotToDo());
        assertFalse(analysis.getThingsNotToDo().isEmpty());
    }

    @Test
    public void testRiskLevelsIncludeUrgentHazard() {
        assertNotNull(RiskLevel.valueOf("LOW"));
        assertNotNull(RiskLevel.valueOf("MEDIUM"));
        assertNotNull(RiskLevel.valueOf("HIGH"));
        assertNotNull(RiskLevel.valueOf("URGENT_HAZARD"));
    }
}
