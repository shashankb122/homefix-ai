package com.homefix.service;

import com.homefix.dto.ExpenseRequest;
import com.homefix.dto.ExpenseResponse;
import com.homefix.entity.RepairExpense;
import com.homefix.entity.RepairReport;
import com.homefix.entity.User;
import com.homefix.exception.ResourceNotFoundException;
import com.homefix.exception.UnauthorizedAccessException;
import com.homefix.repository.RepairExpenseRepository;
import com.homefix.repository.RepairReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final RepairExpenseRepository expenseRepository;
    private final RepairReportRepository repairReportRepository;
    private final FileStorageService fileStorageService;
    private final AuthService authService;

    public ExpenseService(RepairExpenseRepository expenseRepository,
                          RepairReportRepository repairReportRepository,
                          FileStorageService fileStorageService,
                          AuthService authService) {
        this.expenseRepository = expenseRepository;
        this.repairReportRepository = repairReportRepository;
        this.fileStorageService = fileStorageService;
        this.authService = authService;
    }

    @Transactional
    public ExpenseResponse addExpense(ExpenseRequest request, MultipartFile receiptFile) {
        User user = authService.getCurrentAuthenticatedUser();

        RepairReport report = repairReportRepository.findById(request.getRepairReportId())
                .orElseThrow(() -> new ResourceNotFoundException("Repair report not found with id: " + request.getRepairReportId()));

        if (!report.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Cannot add expense to another user's repair report");
        }

        RepairExpense expense = new RepairExpense();
        expense.setUser(user);
        expense.setRepairReport(report);
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setCurrency(StringUtils.hasText(request.getCurrency()) ? request.getCurrency() : "USD");
        expense.setExpenseDate(request.getExpenseDate() != null ? request.getExpenseDate() : java.time.LocalDate.now());

        if (receiptFile != null && !receiptFile.isEmpty()) {
            String filename = fileStorageService.storeFile(receiptFile);
            expense.setReceiptFilename(filename);
        }

        RepairExpense saved = expenseRepository.save(expense);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAllExpensesForCurrentUser() {
        User user = authService.getCurrentAuthenticatedUser();
        return expenseRepository.findByUserOrderByExpenseDateDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesForReport(Long reportId) {
        User user = authService.getCurrentAuthenticatedUser();
        RepairReport report = repairReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair report not found with id: " + reportId));

        if (!report.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Cannot view expenses for another user's repair report");
        }

        return expenseRepository.findByRepairReportAndUserOrderByExpenseDateDesc(report, user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteExpense(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        RepairExpense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Cannot delete another user's expense");
        }

        expenseRepository.delete(expense);
    }

    public ExpenseResponse mapToResponse(RepairExpense expense) {
        ExpenseResponse res = new ExpenseResponse();
        res.setId(expense.getId());
        res.setRepairReportId(expense.getRepairReport().getId());
        res.setRepairReportTitle(expense.getRepairReport().getTitle());
        res.setDescription(expense.getDescription());
        res.setAmount(expense.getAmount());
        res.setCurrency(expense.getCurrency());
        res.setExpenseDate(expense.getExpenseDate());
        res.setCreatedAt(expense.getCreatedAt());
        if (StringUtils.hasText(expense.getReceiptFilename())) {
            res.setReceiptUrl("/api/uploads/" + expense.getReceiptFilename());
        }
        return res;
    }
}
