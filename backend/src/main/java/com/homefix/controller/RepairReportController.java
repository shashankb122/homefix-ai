package com.homefix.controller;

import com.homefix.dto.RepairReportRequest;
import com.homefix.dto.RepairReportResponse;
import com.homefix.dto.RepairReportStatusUpdate;
import com.homefix.service.RepairReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Repair Reports", description = "Create, view, manage, and AI-analyze household repair reports")
public class RepairReportController {

    private final RepairReportService repairReportService;

    public RepairReportController(RepairReportService repairReportService) {
        this.repairReportService = repairReportService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Submit a new repair report with an optional photo for AI analysis")
    public ResponseEntity<RepairReportResponse> createReportMultipart(
            @RequestParam("title") String title,
            @RequestParam("issueDescription") String issueDescription,
            @RequestParam(value = "roomOrLocation", required = false) String roomOrLocation,
            @RequestParam(value = "urgency", required = false, defaultValue = "NORMAL") String urgency,
            @RequestParam(value = "applianceId", required = false) Long applianceId,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        RepairReportRequest request = new RepairReportRequest(title, issueDescription, roomOrLocation, urgency, applianceId);
        RepairReportResponse response = repairReportService.createReport(request, image);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Submit a new repair report as JSON (without photo)")
    public ResponseEntity<RepairReportResponse> createReportJson(@Valid @RequestBody RepairReportRequest request) {
        RepairReportResponse response = repairReportService.createReport(request, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List all repair reports for the currently signed-in user")
    public ResponseEntity<List<RepairReportResponse>> getMyReports() {
        List<RepairReportResponse> reports = repairReportService.getAllReportsForCurrentUser();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{id}")
    @Operation(summary = "View single repair report and full AI safety diagnosis by ID")
    public ResponseEntity<RepairReportResponse> getReportById(@PathVariable Long id) {
        RepairReportResponse report = repairReportService.getReportById(id);
        return ResponseEntity.ok(report);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update repair report status (SUBMITTED, IN_REVIEW, IN_PROGRESS, COMPLETED, CANCELLED)")
    public ResponseEntity<RepairReportResponse> updateReportStatus(
            @PathVariable Long id,
            @Valid @RequestBody RepairReportStatusUpdate statusUpdate) {
        RepairReportResponse response = repairReportService.updateReportStatus(id, statusUpdate);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reanalyze")
    @Operation(summary = "Re-run Gemini AI analysis on an existing repair report")
    public ResponseEntity<RepairReportResponse> reanalyzeReport(@PathVariable Long id) {
        RepairReportResponse response = repairReportService.reanalyzeReport(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a repair report owned by current user")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        repairReportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
}
