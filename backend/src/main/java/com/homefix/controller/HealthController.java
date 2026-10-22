package com.homefix.controller;

import com.homefix.dto.DashboardStatsDto;
import com.homefix.service.DashboardService;
import com.homefix.service.GeminiAiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Health & Dashboard", description = "System health check and dashboard statistics")
public class HealthController {

    private final GeminiAiService geminiAiService;
    private final DashboardService dashboardService;
    private final DataSource dataSource;

    public HealthController(GeminiAiService geminiAiService,
                            DashboardService dashboardService,
                            DataSource dataSource) {
        this.geminiAiService = geminiAiService;
        this.dashboardService = dashboardService;
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    @Operation(summary = "Health check endpoint returning system status, database connection, and AI readiness")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", LocalDateTime.now());
        status.put("service", "HomeFix AI Backend");

        // Check DB connectivity
        boolean dbHealthy = false;
        try (Connection conn = dataSource.getConnection()) {
            dbHealthy = conn.isValid(2);
            status.put("database", dbHealthy ? "CONNECTED" : "UNHEALTHY");
        } catch (Exception e) {
            status.put("database", "DISCONNECTED: " + e.getMessage());
        }

        // Check AI config
        boolean aiConfigured = geminiAiService.isAiConfigured();
        status.put("aiReady", aiConfigured);
        status.put("aiModel", geminiAiService.getActiveModel());
        status.put("aiProvider", "Google Gemini");
        status.put("aiMessage", aiConfigured
                ? "Live Gemini AI integration is active."
                : "Live AI is unconfigured. Set GEMINI_API_KEY environment variable to activate.");

        return ResponseEntity.ok(status);
    }

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get aggregated dashboard statistics for the authenticated user")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }
}
