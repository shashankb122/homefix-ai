package com.homefix.service;

import com.homefix.dto.DashboardStatsDto;
import com.homefix.dto.RepairReportResponse;
import com.homefix.entity.RepairStatus;
import com.homefix.entity.User;
import com.homefix.repository.ApplianceRepository;
import com.homefix.repository.MaintenanceReminderRepository;
import com.homefix.repository.RepairExpenseRepository;
import com.homefix.repository.RepairReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final RepairReportRepository repairReportRepository;
    private final ApplianceRepository applianceRepository;
    private final MaintenanceReminderRepository reminderRepository;
    private final RepairExpenseRepository expenseRepository;
    private final RepairReportService repairReportService;
    private final AuthService authService;

    public DashboardService(RepairReportRepository repairReportRepository,
                            ApplianceRepository applianceRepository,
                            MaintenanceReminderRepository reminderRepository,
                            RepairExpenseRepository expenseRepository,
                            RepairReportService repairReportService,
                            AuthService authService) {
        this.repairReportRepository = repairReportRepository;
        this.applianceRepository = applianceRepository;
        this.reminderRepository = reminderRepository;
        this.expenseRepository = expenseRepository;
        this.repairReportService = repairReportService;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        User user = authService.getCurrentAuthenticatedUser();

        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalReports(repairReportRepository.countByUser(user));
        stats.setSubmittedReports(repairReportRepository.countByUserAndStatus(user, RepairStatus.SUBMITTED));
        stats.setInProgressReports(repairReportRepository.countByUserAndStatus(user, RepairStatus.IN_PROGRESS));
        stats.setCompletedReports(repairReportRepository.countByUserAndStatus(user, RepairStatus.COMPLETED));

        stats.setTotalAppliances(applianceRepository.countByUser(user));
        stats.setPendingReminders(reminderRepository.countByUserAndCompletedFalse(user));
        stats.setOverdueReminders(reminderRepository.countByUserAndDueDateBeforeAndCompletedFalse(user, LocalDate.now()));

        BigDecimal totalExp = expenseRepository.sumExpensesByUser(user);
        stats.setTotalExpenses(totalExp != null ? totalExp : BigDecimal.ZERO);

        List<RepairReportResponse> recent = repairReportRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .limit(5)
                .map(repairReportService::mapToResponse)
                .collect(Collectors.toList());
        stats.setRecentReports(recent);

        return stats;
    }
}
