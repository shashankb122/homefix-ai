package com.homefix.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ExpenseResponse {
    private Long id;
    private Long repairReportId;
    private String repairReportTitle;
    private String description;
    private BigDecimal amount;
    private String currency;
    private LocalDate expenseDate;
    private String receiptUrl;
    private LocalDateTime createdAt;

    public ExpenseResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRepairReportId() {
        return repairReportId;
    }

    public void setRepairReportId(Long repairReportId) {
        this.repairReportId = repairReportId;
    }

    public String getRepairReportTitle() {
        return repairReportTitle;
    }

    public void setRepairReportTitle(String repairReportTitle) {
        this.repairReportTitle = repairReportTitle;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }

    public String getReceiptUrl() {
        return receiptUrl;
    }

    public void setReceiptUrl(String receiptUrl) {
        this.receiptUrl = receiptUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
