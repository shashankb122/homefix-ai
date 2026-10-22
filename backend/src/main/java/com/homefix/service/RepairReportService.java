package com.homefix.service;

import com.homefix.dto.*;
import com.homefix.entity.*;
import com.homefix.exception.ResourceNotFoundException;
import com.homefix.exception.UnauthorizedAccessException;
import com.homefix.repository.ApplianceRepository;
import com.homefix.repository.RepairReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RepairReportService {

    private final RepairReportRepository repairReportRepository;
    private final ApplianceRepository applianceRepository;
    private final FileStorageService fileStorageService;
    private final GeminiAiService geminiAiService;
    private final AuthService authService;

    public RepairReportService(RepairReportRepository repairReportRepository,
                               ApplianceRepository applianceRepository,
                               FileStorageService fileStorageService,
                               GeminiAiService geminiAiService,
                               AuthService authService) {
        this.repairReportRepository = repairReportRepository;
        this.applianceRepository = applianceRepository;
        this.fileStorageService = fileStorageService;
        this.geminiAiService = geminiAiService;
        this.authService = authService;
    }

    @Transactional
    public RepairReportResponse createReport(RepairReportRequest request, MultipartFile imageFile) {
        User user = authService.getCurrentAuthenticatedUser();

        RepairReport report = new RepairReport();
        report.setUser(user);
        report.setTitle(request.getTitle());
        report.setIssueDescription(request.getIssueDescription());
        report.setRoomOrLocation(request.getRoomOrLocation());
        report.setUrgency(StringUtils.hasText(request.getUrgency()) ? request.getUrgency() : "NORMAL");
        report.setStatus(RepairStatus.SUBMITTED);

        if (request.getApplianceId() != null) {
            Appliance appliance = applianceRepository.findByIdAndUser(request.getApplianceId(), user)
                    .orElse(null);
            report.setAppliance(appliance);
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            String storedFilename = fileStorageService.storeFile(imageFile);
            report.setImageFilename(storedFilename);
            report.setImageContentType(imageFile.getContentType());
        }

        // Trigger AI analysis with Gemini
        AiAnalysis analysis = geminiAiService.analyzeRepair(
                report.getTitle(),
                report.getIssueDescription(),
                report.getRoomOrLocation(),
                report.getImageFilename()
        );
        report.setAiAnalysis(analysis);

        RepairReport saved = repairReportRepository.save(report);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RepairReportResponse> getAllReportsForCurrentUser() {
        User user = authService.getCurrentAuthenticatedUser();
        return repairReportRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RepairReportResponse getReportById(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        RepairReport report = repairReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair report not found with id: " + id));

        if (!report.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to view this repair report");
        }

        return mapToResponse(report);
    }

    @Transactional
    public RepairReportResponse updateReportStatus(Long id, RepairReportStatusUpdate statusUpdate) {
        User user = authService.getCurrentAuthenticatedUser();
        RepairReport report = repairReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair report not found with id: " + id));

        if (!report.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to modify this repair report");
        }

        report.setStatus(statusUpdate.getStatus());
        RepairReport updated = repairReportRepository.save(report);
        return mapToResponse(updated);
    }

    @Transactional
    public RepairReportResponse reanalyzeReport(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        RepairReport report = repairReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair report not found with id: " + id));

        if (!report.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to re-analyze this repair report");
        }

        AiAnalysis freshAnalysis = geminiAiService.analyzeRepair(
                report.getTitle(),
                report.getIssueDescription(),
                report.getRoomOrLocation(),
                report.getImageFilename()
        );

        report.setAiAnalysis(freshAnalysis);
        RepairReport saved = repairReportRepository.save(report);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteReport(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        RepairReport report = repairReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair report not found with id: " + id));

        if (!report.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to delete this repair report");
        }

        repairReportRepository.delete(report);
    }

    public RepairReportResponse mapToResponse(RepairReport report) {
        RepairReportResponse dto = new RepairReportResponse();
        dto.setId(report.getId());
        dto.setTitle(report.getTitle());
        dto.setIssueDescription(report.getIssueDescription());
        dto.setRoomOrLocation(report.getRoomOrLocation());
        dto.setUrgency(report.getUrgency());
        dto.setStatus(report.getStatus());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setUpdatedAt(report.getUpdatedAt());

        if (StringUtils.hasText(report.getImageFilename())) {
            dto.setHasImage(true);
            dto.setImageUrl("/api/uploads/" + report.getImageFilename());
        } else {
            dto.setHasImage(false);
            dto.setImageUrl(null);
        }

        if (report.getAppliance() != null) {
            dto.setApplianceId(report.getAppliance().getId());
            dto.setApplianceName(report.getAppliance().getName());
        }

        if (report.getAiAnalysis() != null) {
            AiAnalysis a = report.getAiAnalysis();
            AiAnalysisResultDto aiDto = new AiAnalysisResultDto();
            aiDto.setId(a.getId());
            aiDto.setProblemCategory(a.getProblemCategory());
            aiDto.setSimpleSummary(a.getSimpleSummary());
            aiDto.setRiskLevel(a.getRiskLevel());
            aiDto.setPossibleCauses(a.getPossibleCauses());
            aiDto.setSafeImmediateSteps(a.getSafeImmediateSteps());
            aiDto.setThingsNotToDo(a.getThingsNotToDo());
            aiDto.setProfessionalRecommended(a.isProfessionalRecommended());
            aiDto.setFollowUpQuestions(a.getFollowUpQuestions());
            aiDto.setConfidenceNote(a.getConfidenceNote());
            aiDto.setLiveAiConfigured(a.isLiveAiConfigured());
            aiDto.setAnalyzedAt(a.getAnalyzedAt());
            dto.setAiAnalysis(aiDto);
        }

        BigDecimal total = BigDecimal.ZERO;
        if (report.getExpenses() != null && !report.getExpenses().isEmpty()) {
            List<ExpenseResponse> expenseDtos = report.getExpenses().stream().map(e -> {
                ExpenseResponse er = new ExpenseResponse();
                er.setId(e.getId());
                er.setRepairReportId(report.getId());
                er.setRepairReportTitle(report.getTitle());
                er.setDescription(e.getDescription());
                er.setAmount(e.getAmount());
                er.setCurrency(e.getCurrency());
                er.setExpenseDate(e.getExpenseDate());
                er.setCreatedAt(e.getCreatedAt());
                if (StringUtils.hasText(e.getReceiptFilename())) {
                    er.setReceiptUrl("/api/uploads/" + e.getReceiptFilename());
                }
                return er;
            }).collect(Collectors.toList());
            dto.setExpenses(expenseDtos);

            for (RepairExpense e : report.getExpenses()) {
                if (e.getAmount() != null) {
                    total = total.add(e.getAmount());
                }
            }
        }
        dto.setTotalExpenses(total);

        return dto;
    }
}
