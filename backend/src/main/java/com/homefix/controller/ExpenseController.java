package com.homefix.controller;

import com.homefix.dto.ExpenseRequest;
import com.homefix.dto.ExpenseResponse;
import com.homefix.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@Tag(name = "Repair Expenses", description = "Track and manage home repair costs and receipts")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Record a repair expense with an optional receipt upload")
    public ResponseEntity<ExpenseResponse> addExpenseMultipart(
            @RequestParam("repairReportId") Long repairReportId,
            @RequestParam("description") String description,
            @RequestParam("amount") BigDecimal amount,
            @RequestParam(value = "currency", required = false, defaultValue = "USD") String currency,
            @RequestParam(value = "expenseDate", required = false) LocalDate expenseDate,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt) {

        ExpenseRequest request = new ExpenseRequest(repairReportId, description, amount, currency, expenseDate);
        ExpenseResponse response = expenseService.addExpense(request, receipt);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Record a repair expense as JSON")
    public ResponseEntity<ExpenseResponse> addExpenseJson(@Valid @RequestBody ExpenseRequest request) {
        ExpenseResponse response = expenseService.addExpense(request, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List all repair expenses for current user")
    public ResponseEntity<List<ExpenseResponse>> getMyExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpensesForCurrentUser());
    }

    @GetMapping("/report/{reportId}")
    @Operation(summary = "Get expenses associated with a specific repair report")
    public ResponseEntity<List<ExpenseResponse>> getExpensesForReport(@PathVariable Long reportId) {
        return ResponseEntity.ok(expenseService.getExpensesForReport(reportId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an expense record")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
