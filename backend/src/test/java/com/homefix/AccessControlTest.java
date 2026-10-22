package com.homefix;

import com.homefix.dto.ExpenseRequest;
import com.homefix.dto.RepairReportRequest;
import com.homefix.dto.RepairReportResponse;
import com.homefix.dto.RepairReportStatusUpdate;
import com.homefix.entity.RepairStatus;
import com.homefix.entity.Role;
import com.homefix.entity.User;
import com.homefix.exception.UnauthorizedAccessException;
import com.homefix.repository.RepairExpenseRepository;
import com.homefix.repository.RepairReportRepository;
import com.homefix.repository.UserRepository;
import com.homefix.service.ExpenseService;
import com.homefix.service.RepairReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
public class AccessControlTest {

    @Autowired
    private RepairReportService repairReportService;

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private RepairReportRepository repairReportRepository;

    @Autowired
    private RepairExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    private User alice;
    private User bob;

    @BeforeEach
    public void setup() {
        expenseRepository.deleteAll();
        repairReportRepository.deleteAll();
        userRepository.deleteAll();

        alice = userRepository.save(new User("alice@homefix.ai", "pass123", "Alice", Role.ROLE_USER));
        bob = userRepository.save(new User("bob@homefix.ai", "pass456", "Bob", Role.ROLE_USER));
    }

    private void authenticateAs(User user) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user.getEmail(), null, Collections.emptyList())
        );
    }

    @Test
    public void testUserCannotAccessAnotherUsersReport() {
        // Alice creates a report
        authenticateAs(alice);
        RepairReportRequest request = new RepairReportRequest(
                "Alice's Furnace Problem",
                "Furnace is making strange banging sounds whenever heating starts.",
                "Basement",
                "HIGH",
                null
        );
        RepairReportResponse report = repairReportService.createReport(request, null);

        // Bob tries to view Alice's report
        authenticateAs(bob);
        assertThrows(UnauthorizedAccessException.class, () -> {
            repairReportService.getReportById(report.getId());
        });

        // Bob tries to update status of Alice's report
        assertThrows(UnauthorizedAccessException.class, () -> {
            repairReportService.updateReportStatus(report.getId(), new RepairReportStatusUpdate(RepairStatus.COMPLETED));
        });

        // Bob tries to delete Alice's report
        assertThrows(UnauthorizedAccessException.class, () -> {
            repairReportService.deleteReport(report.getId());
        });

        // Bob tries to add expense to Alice's report
        ExpenseRequest expenseReq = new ExpenseRequest(
                report.getId(),
                "Unauthorized plumber fee",
                BigDecimal.valueOf(150.00),
                "USD",
                LocalDate.now()
        );
        assertThrows(UnauthorizedAccessException.class, () -> {
            expenseService.addExpense(expenseReq, null);
        });
    }
}
