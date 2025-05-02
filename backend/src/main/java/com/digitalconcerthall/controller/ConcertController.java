package com.digitalconcerthall.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.digitalconcerthall.dto.response.ApiResponse;
import com.digitalconcerthall.dto.response.ConcertPerformanceResponse;
import com.digitalconcerthall.dto.response.ConcertResponse;
import com.digitalconcerthall.dto.response.ticket.TicketTypeClientResponse;
import com.digitalconcerthall.model.concert.Concert;
import com.digitalconcerthall.model.concert.Performance;
import com.digitalconcerthall.model.ticket.Ticket; // Add this import
import com.digitalconcerthall.repository.concert.ConcertRepository;
import com.digitalconcerthall.repository.concert.PerformanceRepository;
import com.digitalconcerthall.repository.TicketRepository;

@RestController
@RequestMapping("/api/concerts")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001"}, maxAge = 3600)
public class ConcertController {

	@Autowired
	private ConcertRepository concertRepository;

	@Autowired
	private PerformanceRepository performanceRepository;

	@Autowired
	private TicketRepository ticketRepository; // Ensure this field uses the correct import

	// 獲取所有活躍的音樂會列表
	@GetMapping
	public ResponseEntity<List<ConcertResponse>> getAllConcerts() {
		List<Concert> concerts = concertRepository.findByStatus("active");
		List<ConcertResponse> responses = concerts.stream()
				.map(this::convertToResponse)
				.collect(Collectors.toList());
		return ResponseEntity.ok(responses);
	}

	// 獲取單個音樂會詳情
	@GetMapping("/{id}") // <-- 修改這裡
	public ResponseEntity<?> getConcertById(@PathVariable("id") Long id) {
		Concert concert = concertRepository.findById(id)
				.orElse(null);

		if (concert == null || !concert.getStatus().equals("active")) {
			return ResponseEntity.notFound().build();
		}

		List<Performance> performances = performanceRepository.findByConcertId(id);
		ConcertPerformanceResponse response = convertToDetailResponse(concert, performances);

		return ResponseEntity.ok(response);
	}

	// 獲取即將上演的音樂會
	@GetMapping("/upcoming")
	public ResponseEntity<List<ConcertResponse>> getUpcomingConcerts() {
		// 篩選狀態為 upcoming 的音樂會
		List<Concert> concerts = concertRepository.findByStatus("upcoming");
		List<ConcertResponse> responses = concerts.stream()
				.map(this::convertToResponse)
				.collect(Collectors.toList());
		return ResponseEntity.ok(responses);
	}

	// 獲取過往音樂會
	@GetMapping("/past")
	public ResponseEntity<List<ConcertResponse>> getPastConcerts() {
		List<Concert> concerts = concertRepository.findByStatus("past");
		List<ConcertResponse> responses = concerts.stream()
				.map(this::convertToResponse)
				.collect(Collectors.toList());
		return ResponseEntity.ok(responses);
	}
	
	// 獲取所有音樂會的票券
	@GetMapping("/tickets")
	public ResponseEntity<ApiResponse> getAllConcertTickets() {
		// 注意：這裡的實現目前是佔位符
		try {
			// 這裡應該實現獲取所有音樂會票券的邏輯
			// 目前只返回一個成功響應作為臨時解決方案
			return ResponseEntity.ok(new ApiResponse(true, "獲取音樂會票券成功"));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(new ApiResponse(false, "獲取音樂會票券失敗: " + e.getMessage()));
		}
	}

	// 將 Concert 轉換為 ConcertResponse
	private ConcertResponse convertToResponse(Concert concert) {
		if (concert == null)
			return null;

		List<Performance> performances = performanceRepository.findByConcertId(concert.getId());
		Performance firstPerformance = performances.isEmpty() ? null : performances.get(0);

		ConcertResponse response = new ConcertResponse();
		response.setId(concert.getId());
		response.setTitle(concert.getTitle());
		response.setDescription(concert.getDescription());
		response.setPosterUrl(concert.getPosterUrl());
		response.setStatus(concert.getStatus());

		// 設置第一個場次的時間和地點 (放入列表中)
		if (firstPerformance != null) {
			// Assuming ConcertResponse has setStartTimes(List<LocalDateTime>) and setVenues(List<String>)
			if (firstPerformance.getStartTime() != null) {
				response.setStartTimes(List.of(firstPerformance.getStartTime()));
			} else {
				response.setStartTimes(java.util.Collections.emptyList());
			}
			if (firstPerformance.getVenue() != null) {
				response.setVenues(List.of(firstPerformance.getVenue()));
			} else {
				response.setVenues(java.util.Collections.emptyList());
			}
		} else {
			response.setStartTimes(java.util.Collections.emptyList());
			response.setVenues(java.util.Collections.emptyList());
		}

		response.setPerformanceCount(performances.size());

		// You might also need to calculate and set min/max price here
		// similar to how it's done in ConcertService.java if this response needs it.
		// response.setMinPrice(...);
		// response.setMaxPrice(...);


		return response;
	}

	// 將 Concert 和 Performances 轉換為詳細響應
	private ConcertPerformanceResponse convertToDetailResponse(Concert concert, List<Performance> performances) {
		if (concert == null)
			return null;

		ConcertPerformanceResponse response = new ConcertPerformanceResponse();
		response.setId(concert.getId());
		response.setTitle(concert.getTitle());
		response.setDescription(concert.getDescription());
		response.setPosterUrl(concert.getPosterUrl());
		response.setStatus(concert.getStatus());

		// 添加演出場次信息
		List<ConcertPerformanceResponse.PerformanceInfo> performanceInfos = performances.stream()
				.map(p -> {
					ConcertPerformanceResponse.PerformanceInfo info = new ConcertPerformanceResponse.PerformanceInfo();
					info.setId(p.getId());
					info.setStartTime(p.getStartTime());
					info.setEndTime(p.getEndTime());
					info.setVenue(p.getVenue());
					info.setStatus(p.getStatus());

					// 計算演出時長
					if (p.getStartTime() != null && p.getEndTime() != null) {
						long durationMinutes = java.time.Duration.between(p.getStartTime(), p.getEndTime()).toMinutes();
						info.setDuration((int) durationMinutes);
					} else {
						info.setDuration(120); // 默認2小時
					}

					// --- 修改：獲取並轉換票券信息為 TicketTypeClientResponse ---
					List<Ticket> ticketsForPerformance = ticketRepository.findByPerformance_Id(p.getId());
					List<TicketTypeClientResponse> ticketResponses = ticketsForPerformance.stream()
						.map(ticket -> {
							TicketTypeClientResponse ticketDto = new TicketTypeClientResponse();
							ticketDto.setId(ticket.getId()); // 使用 Ticket 的 ID
							ticketDto.setPerformanceId(ticket.getPerformanceId());
							ticketDto.setAvailableQuantity(ticket.getAvailableQuantity());
							// 從關聯的 TicketType 獲取信息
							if (ticket.getTicketType() != null) {
								ticketDto.setTicketTypeId(ticket.getTicketType().getId());
								ticketDto.setName(ticket.getTicketType().getName());
								ticketDto.setDescription(ticket.getTicketType().getDescription());
								ticketDto.setColorCode(ticket.getTicketType().getColorCode());
								ticketDto.setPrice(ticket.getTicketType().getPrice()); // <--- 修改：從 TicketType 讀取價格
							} else {
								// 處理 TicketType 為 null 的情況
								ticketDto.setName("未知票種");
								ticketDto.setDescription("");
								ticketDto.setColorCode("#cccccc"); // 預設顏色
								// 如果 TicketType 為 null，價格也設為 0 或其他預設值
								ticketDto.setPrice(java.math.BigDecimal.ZERO); 
							}
							return ticketDto;
						})
						.collect(Collectors.toList());
					info.setTickets(ticketResponses); // 設置票券信息
					// --- 結束修改 ---

					return info;
				})
				.collect(Collectors.toList());

		response.setPerformances(performanceInfos);

		return response;
	}
}