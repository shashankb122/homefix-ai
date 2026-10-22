package com.homefix.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardStatsDto {
    private long totalReports;
    private long submittedReports;
    private long inProgressReports;
    private long completedReports;
    private long totalAppliances;
    private long pendingReminders;
    private long overdueReminders;
    private BigDecimal totalExpenses;
    private List<RepairReportResponse> recentReports;

    public DashboardStatsDto() {
        this.totalExpenses = BigDecimal.ZERO;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(long totalReports) {
        this.totalReports = totalReports;
    }

    public long getSubmittedReports() {
        return submittedReports;
    }

    public void setSubmittedReports(long submittedReports) {
        this.submittedReports = submittedReports;
    }

    public long getInProgressReports() {
        return inProgressReports;
    }

    public void setInProgressReports(long inProgressReports) {
        this.inProgressReports = inProgressReports;
    }

    public long getCompletedReports() {
        return completedReports;
    }

    public void setCompletedReports(long completedReports) {
        this.completedReports = completedReports;
    }

    public long getTotalAppliances() {
        return totalAppliances;
    }

    public void setTotalAppliances(long totalAppliances) {
        this.totalAppliances = totalAppliances;
    }

    public long getPendingReminders() {
        return pendingReminders;
    }

    public void setPendingReminders(long pendingReminders) {
        this.pendingReminders = pendingReminders;
    }

    public long getOverdueReminders() {
        return overdueReminders;
    }

    public void setOverdueReminders(long overdueReminders) {
        this.overdueReminders = overdueReminders;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public List<RepairReportResponse> getRecentReports() {
        return recentReports;
    }

    public void setRecentReports(List<RepairReportResponse> recentReports) {
        this.recentReports = recentReports;
    }
}
