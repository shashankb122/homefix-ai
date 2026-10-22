package com.homefix.controller;

import com.homefix.dto.ApplianceRequest;
import com.homefix.dto.ApplianceResponse;
import com.homefix.service.ApplianceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appliances")
@Tag(name = "Appliances", description = "Appliance warranty tracking and service history")
public class ApplianceController {

    private final ApplianceService applianceService;

    public ApplianceController(ApplianceService applianceService) {
        this.applianceService = applianceService;
    }

    @PostMapping
    @Operation(summary = "Register a new household appliance")
    public ResponseEntity<ApplianceResponse> createAppliance(@Valid @RequestBody ApplianceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applianceService.createAppliance(request));
    }

    @GetMapping
    @Operation(summary = "List all appliances owned by current user")
    public ResponseEntity<List<ApplianceResponse>> getMyAppliances() {
        return ResponseEntity.ok(applianceService.getAllAppliancesForCurrentUser());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appliance details by ID")
    public ResponseEntity<ApplianceResponse> getApplianceById(@PathVariable Long id) {
        return ResponseEntity.ok(applianceService.getApplianceById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update appliance warranty or service history")
    public ResponseEntity<ApplianceResponse> updateAppliance(@PathVariable Long id, @Valid @RequestBody ApplianceRequest request) {
        return ResponseEntity.ok(applianceService.updateAppliance(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an appliance record")
    public ResponseEntity<Void> deleteAppliance(@PathVariable Long id) {
        applianceService.deleteAppliance(id);
        return ResponseEntity.noContent().build();
    }
}
