package com.homefix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class MaintenanceReminderRequest {

    private Long applianceId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private Integer recurrenceDays;

    public MaintenanceReminderRequest() {
    }

    public MaintenanceReminderRequest(Long applianceId, String title, String description, LocalDate dueDate, Integer recurrenceDays) {
        this.applianceId = applianceId;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.recurrenceDays = recurrenceDays;
    }

    public Long getApplianceId() {
        return applianceId;
    }

    public void setApplianceId(Long applianceId) {
        this.applianceId = applianceId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Integer getRecurrenceDays() {
        return recurrenceDays;
    }

    public void setRecurrenceDays(Integer recurrenceDays) {
        this.recurrenceDays = recurrenceDays;
    }
}
