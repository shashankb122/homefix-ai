package com.homefix.service;

import com.homefix.dto.ApplianceRequest;
import com.homefix.dto.ApplianceResponse;
import com.homefix.entity.Appliance;
import com.homefix.entity.User;
import com.homefix.exception.ResourceNotFoundException;
import com.homefix.exception.UnauthorizedAccessException;
import com.homefix.repository.ApplianceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplianceService {

    private final ApplianceRepository applianceRepository;
    private final AuthService authService;

    public ApplianceService(ApplianceRepository applianceRepository, AuthService authService) {
        this.applianceRepository = applianceRepository;
        this.authService = authService;
    }

    @Transactional
    public ApplianceResponse createAppliance(ApplianceRequest request) {
        User user = authService.getCurrentAuthenticatedUser();

        Appliance appliance = new Appliance();
        appliance.setUser(user);
        appliance.setName(request.getName());
        appliance.setBrand(request.getBrand());
        appliance.setModelNumber(request.getModelNumber());
        appliance.setSerialNumber(request.getSerialNumber());
        appliance.setPurchaseDate(request.getPurchaseDate());
        appliance.setWarrantyExpiryDate(request.getWarrantyExpiryDate());
        appliance.setNotes(request.getNotes());
        appliance.setServiceHistory(request.getServiceHistory());

        Appliance saved = applianceRepository.save(appliance);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ApplianceResponse> getAllAppliancesForCurrentUser() {
        User user = authService.getCurrentAuthenticatedUser();
        return applianceRepository.findByUserOrderByNameAsc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplianceResponse getApplianceById(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Appliance appliance = applianceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appliance not found with id: " + id));

        if (!appliance.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Cannot access another user's appliance record");
        }

        return mapToResponse(appliance);
    }

    @Transactional
    public ApplianceResponse updateAppliance(Long id, ApplianceRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        Appliance appliance = applianceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appliance not found with id: " + id));

        if (!appliance.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Cannot edit another user's appliance record");
        }

        appliance.setName(request.getName());
        appliance.setBrand(request.getBrand());
        appliance.setModelNumber(request.getModelNumber());
        appliance.setSerialNumber(request.getSerialNumber());
        appliance.setPurchaseDate(request.getPurchaseDate());
        appliance.setWarrantyExpiryDate(request.getWarrantyExpiryDate());
        appliance.setNotes(request.getNotes());
        appliance.setServiceHistory(request.getServiceHistory());

        Appliance updated = applianceRepository.save(appliance);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteAppliance(Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Appliance appliance = applianceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appliance not found with id: " + id));

        if (!appliance.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Cannot delete another user's appliance record");
        }

        applianceRepository.delete(appliance);
    }

    public ApplianceResponse mapToResponse(Appliance appliance) {
        ApplianceResponse res = new ApplianceResponse();
        res.setId(appliance.getId());
        res.setName(appliance.getName());
        res.setBrand(appliance.getBrand());
        res.setModelNumber(appliance.getModelNumber());
        res.setSerialNumber(appliance.getSerialNumber());
        res.setPurchaseDate(appliance.getPurchaseDate());
        res.setWarrantyExpiryDate(appliance.getWarrantyExpiryDate());
        res.setNotes(appliance.getNotes());
        res.setServiceHistory(appliance.getServiceHistory());
        res.setCreatedAt(appliance.getCreatedAt());
        res.setUpdatedAt(appliance.getUpdatedAt());
        return res;
    }
}
