package com.homefix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RepairReportRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Issue description is required")
    @Size(min = 10, max = 5000, message = "Issue description must be between 10 and 5000 characters")
    private String issueDescription;

    private String roomOrLocation;

    private String urgency = "NORMAL";

    private Long applianceId;

    public RepairReportRequest() {
    }

    public RepairReportRequest(String title, String issueDescription, String roomOrLocation, String urgency, Long applianceId) {
        this.title = title;
        this.issueDescription = issueDescription;
        this.roomOrLocation = roomOrLocation;
        this.urgency = urgency;
        this.applianceId = applianceId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getIssueDescription() {
        return issueDescription;
    }

    public void setIssueDescription(String issueDescription) {
        this.issueDescription = issueDescription;
    }

    public String getRoomOrLocation() {
        return roomOrLocation;
    }

    public void setRoomOrLocation(String roomOrLocation) {
        this.roomOrLocation = roomOrLocation;
    }

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }

    public Long getApplianceId() {
        return applianceId;
    }

    public void setApplianceId(Long applianceId) {
        this.applianceId = applianceId;
    }
}
