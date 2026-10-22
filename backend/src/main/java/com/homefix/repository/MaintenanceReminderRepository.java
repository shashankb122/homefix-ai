package com.homefix.repository;

import com.homefix.entity.MaintenanceReminder;
import com.homefix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceReminderRepository extends JpaRepository<MaintenanceReminder, Long> {
    List<MaintenanceReminder> findByUserOrderByDueDateAsc(User user);
    Optional<MaintenanceReminder> findByIdAndUser(Long id, User user);
    List<MaintenanceReminder> findByUserAndCompletedFalseOrderByDueDateAsc(User user);
    long countByUserAndCompletedFalse(User user);
    long countByUserAndDueDateBeforeAndCompletedFalse(User user, LocalDate date);
}
