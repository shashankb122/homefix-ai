package com.homefix.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ai_analyses")
public class AiAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String problemCategory;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String simpleSummary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskLevel riskLevel = RiskLevel.LOW;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "ai_possible_causes", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "cause", columnDefinition = "TEXT")
    private List<String> possibleCauses = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "ai_safe_steps", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "step", columnDefinition = "TEXT")
    private List<String> safeImmediateSteps = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "ai_not_to_do", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "warning", columnDefinition = "TEXT")
    private List<String> thingsNotToDo = new ArrayList<>();

    @Column(nullable = false)
    private boolean professionalRecommended = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "ai_followup_questions", joinColumns = @JoinColumn(name = "analysis_id"))
    @Column(name = "question", columnDefinition = "TEXT")
    private List<String> followUpQuestions = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String confidenceNote;

    @Column(nullable = false)
    private boolean liveAiConfigured = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime analyzedAt = LocalDateTime.now();

    public AiAnalysis() {
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

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(LocalDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }
}
