package com.homefix.service;

import com.homefix.dto.MaintenanceReminderRequest;
import com.homefix.dto.MaintenanceReminderResponse;
import com.homefix.entity.Appliance;
import com.homefix.entity.MaintenanceReminder;
import com.homefix.entity.User;
import com.homefix.exception.ResourceNotFoundException;
import com.homefix.exception.UnauthorizedAccessException;
import com.homefix.repository.ApplianceRepository;
import com.homefix.repository.MaintenanceReminderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaintenanceReminderService {

    private final MaintenanceReminderRepository reminderRepository;
    private final ApplianceRepository applianceRepository;
    private final AuthService authService;

    public MaintenanceReminderService(MaintenanceReminderRepository reminderRepository,
                                      ApplianceRepository applianceRepository,
                                      AuthService authService) {
        this.reminderRepository = reminderRepository;
        this.applianceRepository = applianceRepository;
        this.authService = authService;
    }

    @Transactional
    public MaintenanceReminderResponse createReminder(MaintenanceReminderRequest request) {
        User user = authService.getCurrentAuthenticatedUser();

        MaintenanceReminder reminder = new MaintenanceReminder();
        reminder.setUser(user);
        reminder.setTitle(request.getTitle());
        reminder.setDescription(request.getDescription());
        reminder.setDueDate(request.getDueDate());
        reminder.setRecurrenceDays(request.getRecurrenceDays());
        reminder.setCompleted(false);

        if (request.getApplianceId() != null) {
            Appliance appliance = applianceRepository.findByIdAndUser(request.getApplianceId(), user)
                    .orElse(null);
            reminder.setAppliance(appliance);
        }

        MaintenanceReminder saved = reminderRepository.save(reminder);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceReminderResponse> getAllRemindersForCurrentUser() {
        User user = authService.getCurrentAuthenticatedUser();
        return reminderRepository.findByUserOrderByDueDateAsc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MaintenanceReminderResponse toggleCompletion(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        MaintenanceReminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + id));

        if (!reminder.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Cannot modify another user's reminder");
        }

        boolean newStatus = !reminder.isCompleted();
        reminder.setCompleted(newStatus);

        // If completed and has recurrence, schedule the next reminder automatically
        if (newStatus && reminder.getRecurrenceDays() != null && reminder.getRecurrenceDays() > 0) {
            MaintenanceReminder nextReminder = new MaintenanceReminder();
            nextReminder.setUser(user);
            nextReminder.setAppliance(reminder.getAppliance());
            nextReminder.setTitle(reminder.getTitle());
            nextReminder.setDescription(reminder.getDescription());
            nextReminder.setDueDate(reminder.getDueDate().plusDays(reminder.getRecurrenceDays()));
            nextReminder.setRecurrenceDays(reminder.getRecurrenceDays());
            nextReminder.setCompleted(false);
            reminderRepository.save(nextReminder);
        }

        MaintenanceReminder saved = reminderRepository.save(reminder);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteReminder(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        MaintenanceReminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + id));

        if (!reminder.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Cannot delete another user's reminder");
        }

        reminderRepository.delete(reminder);
    }

    public MaintenanceReminderResponse mapToResponse(MaintenanceReminder r) {
        MaintenanceReminderResponse res = new MaintenanceReminderResponse();
        res.setId(r.getId());
        res.setTitle(r.getTitle());
        res.setDescription(r.getDescription());
        res.setDueDate(r.getDueDate());
        res.setCompleted(r.isCompleted());
        res.setRecurrenceDays(r.getRecurrenceDays());
        res.setCreatedAt(r.getCreatedAt());
        res.setUpdatedAt(r.getUpdatedAt());

        if (r.getAppliance() != null) {
            res.setApplianceId(r.getAppliance().getId());
            res.setApplianceName(r.getAppliance().getName());
        }

        return res;
    }
}
