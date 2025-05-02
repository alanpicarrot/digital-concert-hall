package com.digitalconcerthall.controller.admin;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.digitalconcerthall.dto.request.TicketRequest;
import com.digitalconcerthall.dto.response.ApiResponse;
import com.digitalconcerthall.model.concert.Performance;
import com.digitalconcerthall.model.ticket.Ticket;
import com.digitalconcerthall.model.ticket.TicketType;
import com.digitalconcerthall.repository.concert.PerformanceRepository;
import com.digitalconcerthall.repository.TicketRepository;
import com.digitalconcerthall.repository.TicketTypeRepository;

@RestController
@RequestMapping("/api/admin/tickets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TicketAdminController {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private PerformanceRepository performanceRepository;

    @Autowired
    private TicketTypeRepository ticketTypeRepository;

    // 獲取所有票券
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Ticket>> getAllTickets() {
        List<Ticket> tickets = ticketRepository.findAll();
        return ResponseEntity.ok(tickets);
    }

    // 依演出場次ID獲取票券
    @GetMapping("/performance/{performanceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Ticket>> getTicketsByPerformanceId(@PathVariable("performanceId") Long performanceId) {
        List<Ticket> tickets = ticketRepository.findByPerformance_Id(performanceId);
        return ResponseEntity.ok(tickets);
    }

    // 獲取單個票券
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTicketById(@PathVariable("id") Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElse(null);
        if (ticket == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ticket);
    }

    // 創建新票券
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createTicket(@RequestBody TicketRequest ticketRequest) {
        try {
            // 驗證關聯的演出場次是否存在
            Performance performance = performanceRepository.findById(ticketRequest.getPerformanceId())
                    .orElse(null);
            if (performance == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "找不到相關的演出場次"));
            }

            // 驗證關聯的票種是否存在
            TicketType ticketType = ticketTypeRepository.findById(ticketRequest.getTicketTypeId())
                    .orElse(null);
            if (ticketType == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "找不到相關的票種"));
            }

            Ticket ticket = new Ticket();
            ticket.setPerformance(performance);
            ticket.setTicketType(ticketType);
            ticket.setTotalQuantity(ticketRequest.getTotalQuantity());
            ticket.setAvailableQuantity(ticketRequest.getAvailableQuantity());
            ticket.setCreatedAt(LocalDateTime.now());
            // Set the username from the authenticated user
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            ticket.setUsername(auth.getName());
            
            // Set description
            if (ticketRequest.getDescription() != null) {
                ticket.setDescription(ticketRequest.getDescription());
            }
            
            // Set default status if not provided
            ticket.setStatus("ACTIVE");

            Ticket savedTicket = ticketRepository.save(ticket);
            return ResponseEntity.ok(savedTicket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "創建票券失敗: " + e.getMessage()));
        }
    }

    // 更新票券
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateTicket(@PathVariable("id") Long id, @RequestBody TicketRequest ticketRequest) {
        try {
            Ticket existingTicket = ticketRepository.findById(id).orElse(null);
            if (existingTicket == null) {
                return ResponseEntity.notFound().build();
            }

            // 如果請求中包含演出場次ID，則更新演出場次
            if (ticketRequest.getPerformanceId() != null) {
                Performance performance = performanceRepository.findById(ticketRequest.getPerformanceId()).orElse(null);
                if (performance == null) {
                    return ResponseEntity.badRequest().body(new ApiResponse(false, "找不到相關的演出場次"));
                }
                existingTicket.setPerformance(performance);
            }

            // 如果請求中包含票種ID，則更新票種
            if (ticketRequest.getTicketTypeId() != null) {
                TicketType ticketType = ticketTypeRepository.findById(ticketRequest.getTicketTypeId()).orElse(null);
                if (ticketType == null) {
                    return ResponseEntity.badRequest().body(new ApiResponse(false, "找不到相關的票種"));
                }
                existingTicket.setTicketType(ticketType);
            }

            // 更新數量 - 需要注意業務邏輯：可用數量不能超過總數量
            if (ticketRequest.getTotalQuantity() != null) {
                existingTicket.setTotalQuantity(ticketRequest.getTotalQuantity());
            }

            if (ticketRequest.getAvailableQuantity() != null) {
                // 確保可用數量不超過總數量
                if (ticketRequest.getAvailableQuantity() > existingTicket.getTotalQuantity()) {
                    return ResponseEntity.badRequest().body(new ApiResponse(false, "可用數量不能超過總數量"));
                }
                existingTicket.setAvailableQuantity(ticketRequest.getAvailableQuantity());
            }
            
            // 更新描述
            if (ticketRequest.getDescription() != null) {
                existingTicket.setDescription(ticketRequest.getDescription());
            }
            
            // 更新狀態
            if (ticketRequest.getStatus() != null) {
                existingTicket.setStatus(ticketRequest.getStatus());
            }

            Ticket updatedTicket = ticketRepository.save(existingTicket);
            return ResponseEntity.ok(updatedTicket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "更新票券失敗: " + e.getMessage()));
        }
    }

    // 刪除票券
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTicket(@PathVariable("id") Long id) {
        try {
            Ticket existingTicket = ticketRepository.findById(id).orElse(null);
            if (existingTicket == null) {
                return ResponseEntity.notFound().build();
            }

            // 檢查票券是否已被購買
            if (existingTicket.getTotalQuantity() > existingTicket.getAvailableQuantity()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "無法刪除已被購買的票券"));
            }

            ticketRepository.delete(existingTicket);
            return ResponseEntity.ok(new ApiResponse(true, "票券已成功刪除"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "刪除票券失敗: " + e.getMessage()));
        }
    }

    // 更新票券庫存
    @PatchMapping("/{id}/inventory")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateTicketInventory(@PathVariable("id") Long id,
            @RequestParam(required = false) Integer totalQuantity,
            @RequestParam(required = false) Integer availableQuantity) {
        try {
            Ticket existingTicket = ticketRepository.findById(id).orElse(null);
            if (existingTicket == null) {
                return ResponseEntity.notFound().build();
            }

            if (totalQuantity != null) {
                // 檢查總數量是否小於已售出數量
                int soldQuantity = existingTicket.getTotalQuantity() - existingTicket.getAvailableQuantity();
                if (totalQuantity < soldQuantity) {
                    return ResponseEntity.badRequest().body(new ApiResponse(false, "總數量不能小於已售出數量"));
                }
                existingTicket.setTotalQuantity(totalQuantity);

                // 如果未指定可用數量，則更新可用數量為新總數量減去已售出數量
                if (availableQuantity == null) {
                    existingTicket.setAvailableQuantity(totalQuantity - soldQuantity);
                }
            }

            if (availableQuantity != null) {
                // 確保可用數量不超過總數量且不小於0
                if (availableQuantity > existingTicket.getTotalQuantity()) {
                    return ResponseEntity.badRequest().body(new ApiResponse(false, "可用數量不能超過總數量"));
                }
                if (availableQuantity < 0) {
                    return ResponseEntity.badRequest().body(new ApiResponse(false, "可用數量不能小於0"));
                }
                existingTicket.setAvailableQuantity(availableQuantity);
            }

            Ticket updatedTicket = ticketRepository.save(existingTicket);
            return ResponseEntity.ok(updatedTicket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "更新票券庫存失敗: " + e.getMessage()));
        }
    }
}
