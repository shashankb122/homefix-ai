package com.homefix;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.homefix.dto.ExpenseRequest;
import com.homefix.dto.RepairReportRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "valuser@homefix.ai")
    public void testRepairReportShortDescriptionValidation() throws Exception {
        // Description must be at least 10 characters
        RepairReportRequest request = new RepairReportRequest("Sink broken", "Too short", "Kitchen", "NORMAL", null);

        mockMvc.perform(post("/api/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.issueDescription").exists());
    }

    @Test
    @WithMockUser(username = "valuser@homefix.ai")
    public void testExpenseZeroOrNegativeAmountValidation() throws Exception {
        // Amount must be >= 0.01
        ExpenseRequest request = new ExpenseRequest(1L, "Invalid zero expense", BigDecimal.ZERO, "USD", LocalDate.now());

        mockMvc.perform(post("/api/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.amount").exists());
    }
}
