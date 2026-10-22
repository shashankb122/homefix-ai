package com.homefix;

import com.homefix.dto.RepairReportRequest;
import com.homefix.dto.RepairReportResponse;
import com.homefix.dto.RepairReportStatusUpdate;
import com.homefix.entity.RepairStatus;
import com.homefix.entity.Role;
import com.homefix.entity.User;
import com.homefix.repository.RepairReportRepository;
import com.homefix.repository.UserRepository;
import com.homefix.service.RepairReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class RepairReportServiceTest {

    @Autowired
    private RepairReportService repairReportService;

    @Autowired
    private RepairReportRepository repairReportRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    public void setup() {
        repairReportRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User("reportowner@homefix.ai", "encodedPassword", "Report Owner", Role.ROLE_USER);
        testUser = userRepository.save(testUser);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(testUser.getEmail(), null, Collections.emptyList())
        );
    }

    @Test
    public void testCreateReportWithAiAnalysis() {
        RepairReportRequest request = new RepairReportRequest(
                "Leaking kitchen sink pipe",
                "Water is continuously dripping from the P-trap whenever the kitchen faucet is turned on.",
                "Kitchen",
                "NORMAL",
                null
        );

        RepairReportResponse created = repairReportService.createReport(request, null);

        assertNotNull(created.getId());
        assertEquals("Leaking kitchen sink pipe", created.getTitle());
        assertEquals(RepairStatus.SUBMITTED, created.getStatus());
        assertNotNull(created.getAiAnalysis());
        assertNotNull(created.getAiAnalysis().getRiskLevel());
        assertFalse(created.getAiAnalysis().getSafeImmediateSteps().isEmpty());
    }

    @Test
    public void testUpdateReportStatus() {
        RepairReportRequest request = new RepairReportRequest(
                "Dishwasher not draining",
                "Water remains at the bottom of the tub after a full cycle completes.",
                "Kitchen",
                "NORMAL",
                null
        );

        RepairReportResponse created = repairReportService.createReport(request, null);
        RepairReportResponse updated = repairReportService.updateReportStatus(
                created.getId(),
                new RepairReportStatusUpdate(RepairStatus.IN_PROGRESS)
        );

        assertEquals(RepairStatus.IN_PROGRESS, updated.getStatus());
    }

    @Test
    public void testListOnlyUserReports() {
        RepairReportRequest req1 = new RepairReportRequest("Issue 1", "Detailed description for issue 1", "Room 1", "NORMAL", null);
        RepairReportRequest req2 = new RepairReportRequest("Issue 2", "Detailed description for issue 2", "Room 2", "HIGH", null);

        repairReportService.createReport(req1, null);
        repairReportService.createReport(req2, null);

        List<RepairReportResponse> list = repairReportService.getAllReportsForCurrentUser();
        assertEquals(2, list.size());
    }
}
