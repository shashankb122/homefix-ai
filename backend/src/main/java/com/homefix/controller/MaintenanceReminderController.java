package com.homefix.controller;

import com.homefix.dto.MaintenanceReminderRequest;
import com.homefix.dto.MaintenanceReminderResponse;
import com.homefix.service.MaintenanceReminderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@Tag(name = "Maintenance Reminders", description = "Schedule and track recurring home and appliance maintenance tasks")
public class MaintenanceReminderController {

    private final MaintenanceReminderService reminderService;

    public MaintenanceReminderController(MaintenanceReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @PostMapping
    @Operation(summary = "Create a new maintenance reminder")
    public ResponseEntity<MaintenanceReminderResponse> createReminder(@Valid @RequestBody MaintenanceReminderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reminderService.createReminder(request));
    }

    @GetMapping
    @Operation(summary = "List all maintenance reminders for current user")
    public ResponseEntity<List<MaintenanceReminderResponse>> getMyReminders() {
        return ResponseEntity.ok(reminderService.getAllRemindersForCurrentUser());
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle reminder completion status (automatically schedules next date if recurring)")
    public ResponseEntity<MaintenanceReminderResponse> toggleCompletion(@PathVariable Long id) {
        return ResponseEntity.ok(reminderService.toggleCompletion(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a maintenance reminder")
    public ResponseEntity<Void> deleteReminder(@PathVariable Long id) {
        reminderService.deleteReminder(id);
        return ResponseEntity.noContent().build();
    }
}
