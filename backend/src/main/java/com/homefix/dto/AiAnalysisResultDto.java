package com.homefix.dto;

import com.homefix.entity.RiskLevel;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class AiAnalysisResultDto {
    private Long id;
    private String problemCategory;
    private String simpleSummary;
    private RiskLevel riskLevel;
    private List<String> possibleCauses = new ArrayList<>();
    private List<String> safeImmediateSteps = new ArrayList<>();
    private List<String> thingsNotToDo = new ArrayList<>();
    private boolean professionalRecommended;
    private List<String> followUpQuestions = new ArrayList<>();
    private String confidenceNote;
    private boolean liveAiConfigured;
    private String statusMessage;
    private LocalDateTime analyzedAt;

    public AiAnalysisResultDto() {
        this.analyzedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProblemCategory() {
        return problemCategory;
    }

    public void setProblemCategory(String problemCategory) {
        this.problemCategory = problemCategory;
    }

    public String getSimpleSummary() {
        return simpleSummary;
    }

    public void setSimpleSummary(String simpleSummary) {
        this.simpleSummary = simpleSummary;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }

    public List<String> getPossibleCauses() {
        return possibleCauses;
    }

    public void setPossibleCauses(List<String> possibleCauses) {
        this.possibleCauses = possibleCauses != null ? possibleCauses : new ArrayList<>();
    }

    public List<String> getSafeImmediateSteps() {
        return safeImmediateSteps;
    }

    public void setSafeImmediateSteps(List<String> safeImmediateSteps) {
        this.safeImmediateSteps = safeImmediateSteps != null ? safeImmediateSteps : new ArrayList<>();
    }

    public List<String> getThingsNotToDo() {
        return thingsNotToDo;
    }

    public void setThingsNotToDo(List<String> thingsNotToDo) {
        this.thingsNotToDo = thingsNotToDo != null ? thingsNotToDo : new ArrayList<>();
    }

    public boolean isProfessionalRecommended() {
        return professionalRecommended;
    }

    public void setProfessionalRecommended(boolean professionalRecommended) {
        this.professionalRecommended = professionalRecommended;
    }

    public List<String> getFollowUpQuestions() {
        return followUpQuestions;
    }

    public void setFollowUpQuestions(List<String> followUpQuestions) {
        this.followUpQuestions = followUpQuestions != null ? followUpQuestions : new ArrayList<>();
    }

    public String getConfidenceNote() {
        return confidenceNote;
    }

    public void setConfidenceNote(String confidenceNote) {
        this.confidenceNote = confidenceNote;
    }

    public boolean isLiveAiConfigured() {
        return liveAiConfigured;
    }

    public void setLiveAiConfigured(boolean liveAiConfigured) {
        this.liveAiConfigured = liveAiConfigured;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(LocalDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }
}
