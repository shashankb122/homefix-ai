package com.homefix.repository;

import com.homefix.entity.RepairReport;
import com.homefix.entity.RepairStatus;
import com.homefix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepairReportRepository extends JpaRepository<RepairReport, Long> {
    List<RepairReport> findByUserOrderByCreatedAtDesc(User user);
    Optional<RepairReport> findByIdAndUser(Long id, User user);
    long countByUser(User user);
    long countByUserAndStatus(User user, RepairStatus status);
}
