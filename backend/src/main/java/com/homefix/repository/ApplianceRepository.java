package com.homefix.repository;

import com.homefix.entity.Appliance;
import com.homefix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplianceRepository extends JpaRepository<Appliance, Long> {
    List<Appliance> findByUserOrderByNameAsc(User user);
    Optional<Appliance> findByIdAndUser(Long id, User user);
    long countByUser(User user);
}
