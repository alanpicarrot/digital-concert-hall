package com.digitalconcerthall.controller.admin;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.response.ApiResponse;
import com.digitalconcerthall.model.ticket.TicketType;
import com.digitalconcerthall.repository.ticket.TicketTypeRepository;

@RestController
@RequestMapping("/api/admin/setup")
public class TicketSetupController {

    @Autowired
    private TicketTypeRepository ticketTypeRepository;

    @GetMapping("/fix-dates")
    public ResponseEntity<?> fixMissingDates() {
        try {
            // 獲取所有沒有創建日期的票種
            List<TicketType> ticketTypes = ticketTypeRepository.findAll();
            int count = 0;

            for (TicketType type : ticketTypes) {
                // 檢查是否缺少創建日期
                if (type.getCreatedAt() == null) {
                    type.setCreatedAt(LocalDateTime.now()); // 確保方法存在
                    ticketTypeRepository.save(type);
                    count++;
                    System.out.println("Updated ticket type ID: " + type.getId() + ", Name: " + type.getName()
                            + " with current date");
                }
            }

            return ResponseEntity.ok(new ApiResponse(true, "成功修復 " + count + " 個票種的日期"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ApiResponse(false, "修復日期時發生錯誤: " + e.getMessage()));
        }
    }
}
