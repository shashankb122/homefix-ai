package com.homefix.dto;

import com.homefix.entity.RepairStatus;
import jakarta.validation.constraints.NotNull;

public class RepairReportStatusUpdate {

    @NotNull(message = "Status is required")
    private RepairStatus status;

    public RepairReportStatusUpdate() {
    }

    public RepairReportStatusUpdate(RepairStatus status) {
        this.status = status;
    }

    public RepairStatus getStatus() {
        return status;
    }

    public void setStatus(RepairStatus status) {
        this.status = status;
    }
}
