package com.homefix.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseRequest {

    @NotNull(message = "Repair report ID is required")
    private Long repairReportId;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    private String currency = "USD";

    private LocalDate expenseDate = LocalDate.now();

    public ExpenseRequest() {
    }

    public ExpenseRequest(Long repairReportId, String description, BigDecimal amount, String currency, LocalDate expenseDate) {
        this.repairReportId = repairReportId;
        this.description = description;
        this.amount = amount;
        this.currency = currency != null ? currency : "USD";
        this.expenseDate = expenseDate != null ? expenseDate : LocalDate.now();
    }

    public Long getRepairReportId() {
        return repairReportId;
    }

    public void setRepairReportId(Long repairReportId) {
        this.repairReportId = repairReportId;
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
}
