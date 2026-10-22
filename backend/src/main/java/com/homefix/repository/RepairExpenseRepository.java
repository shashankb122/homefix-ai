package com.homefix.repository;

import com.homefix.entity.RepairExpense;
import com.homefix.entity.RepairReport;
import com.homefix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RepairExpenseRepository extends JpaRepository<RepairExpense, Long> {
    List<RepairExpense> findByUserOrderByExpenseDateDesc(User user);
    List<RepairExpense> findByRepairReportAndUserOrderByExpenseDateDesc(RepairReport repairReport, User user);
    Optional<RepairExpense> findByIdAndUser(Long id, User user);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM RepairExpense e WHERE e.user = :user")
    BigDecimal sumExpensesByUser(@Param("user") User user);
}
