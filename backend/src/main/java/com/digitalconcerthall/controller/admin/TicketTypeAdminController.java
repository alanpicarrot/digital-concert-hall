package com.digitalconcerthall.controller.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.digitalconcerthall.dto.request.TicketTypeRequest;
import com.digitalconcerthall.dto.response.ApiResponse;
import com.digitalconcerthall.model.ticket.TicketType;
import com.digitalconcerthall.repository.ticket.TicketTypeRepository;

@RestController
@RequestMapping("/api/admin/ticket-types")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TicketTypeAdminController {

    @Autowired
    private TicketTypeRepository ticketTypeRepository;

    // 獲取所有票種
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketType>> getAllTicketTypes() {
        List<TicketType> ticketTypes = ticketTypeRepository.findAll();
        
        // 打印日期信息以追蹤問題
        for(TicketType type : ticketTypes) {
            System.out.println("TicketType ID: " + type.getId() + 
                               ", Name: " + type.getName() + 
                               ", CreatedAt: " + type.getCreatedAt());
        }
        
        return ResponseEntity.ok(ticketTypes);
    }

    // 獲取單個票種
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTicketTypeById(@PathVariable("id") Long id) {
        TicketType ticketType = ticketTypeRepository.findById(id)
                .orElse(null);
        if (ticketType == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ticketType);
    }

    // 創建新票種
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createTicketType(@RequestBody TicketTypeRequest ticketTypeRequest) {
        try {
            // 檢查票種名稱是否已存在
            if (ticketTypeRepository.findByName(ticketTypeRequest.getName()).isPresent()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "票種名稱已存在"));
            }
            
            TicketType ticketType = new TicketType();
            ticketType.setName(ticketTypeRequest.getName());
            ticketType.setDescription(ticketTypeRequest.getDescription());
            ticketType.setPrice(new BigDecimal(ticketTypeRequest.getPrice()));
            ticketType.setColorCode(ticketTypeRequest.getColorCode());
            ticketType.setCreatedAt(LocalDateTime.now());
            
            TicketType savedTicketType = ticketTypeRepository.save(ticketType);
            return ResponseEntity.ok(savedTicketType);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "創建票種失敗: " + e.getMessage()));
        }
    }

    // 更新票種
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateTicketType(@PathVariable("id") Long id, @RequestBody TicketTypeRequest ticketTypeRequest) {
        try {
            TicketType existingTicketType = ticketTypeRepository.findById(id).orElse(null);
            if (existingTicketType == null) {
                return ResponseEntity.notFound().build();
            }
            
            // 如果更改了名稱，檢查新名稱是否已存在
            if (!existingTicketType.getName().equals(ticketTypeRequest.getName()) && 
                ticketTypeRepository.findByName(ticketTypeRequest.getName()).isPresent()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "票種名稱已存在"));
            }
            
            existingTicketType.setName(ticketTypeRequest.getName());
            existingTicketType.setDescription(ticketTypeRequest.getDescription());
            existingTicketType.setPrice(new BigDecimal(ticketTypeRequest.getPrice()));
            existingTicketType.setColorCode(ticketTypeRequest.getColorCode());
            
            TicketType updatedTicketType = ticketTypeRepository.save(existingTicketType);
            return ResponseEntity.ok(updatedTicketType);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "更新票種失敗: " + e.getMessage()));
        }
    }

    // 刪除票種
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTicketType(@PathVariable("id") Long id) {
        try {
            TicketType existingTicketType = ticketTypeRepository.findById(id).orElse(null);
            if (existingTicketType == null) {
                return ResponseEntity.notFound().build();
            }
            
            // 檢查票種是否已被使用
            // 需要考慮是否有關聯到票券表
            // 這裡需要根據實際情況調整
            
            ticketTypeRepository.delete(existingTicketType);
            return ResponseEntity.ok(new ApiResponse(true, "票種已成功刪除"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "刪除票種失敗: " + e.getMessage()));
        }
    }
}
