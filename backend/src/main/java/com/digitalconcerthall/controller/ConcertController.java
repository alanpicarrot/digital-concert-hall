package com.digitalconcerthall.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.digitalconcerthall.dto.response.ApiResponse;
import com.digitalconcerthall.dto.response.ConcertPerformanceResponse;
import com.digitalconcerthall.dto.response.ConcertResponse;
import com.digitalconcerthall.model.concert.Concert;
import com.digitalconcerthall.model.concert.Performance;
import com.digitalconcerthall.repository.concert.ConcertRepository;
import com.digitalconcerthall.repository.concert.PerformanceRepository;

@RestController
@RequestMapping("/api/concerts")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001", "http://localhost:3002" }, maxAge = 3600)
public class ConcertController {

	@Autowired
	private ConcertRepository concertRepository;

	@Autowired
	private PerformanceRepository performanceRepository;

	// 健康檢查端點
	@GetMapping("/health-check")
	public ResponseEntity<String> ping() {
		return ResponseEntity.ok("Concerts API is working");
	}
	
	// 用於確保會有資料的檢查與修復端點
	@GetMapping("/check-and-seed")
	public ResponseEntity<ApiResponse> checkAndSeedData() {
		try {
			// 查詢音樂會資料
			List<Concert> existingConcerts = concertRepository.findByStatus("active");
			
			// 若無音樂會資料，則創建測試數據
			if (existingConcerts.isEmpty()) {
				createTestData();
				createSpringConcert();
				return ResponseEntity.ok(new ApiResponse(true, "數據已檢查並自動創建：無音樂會資料，已創建測試數據"));
			}
			
			// 查詢春季音樂會
			boolean hasSpringConcert = false;
			for (Concert concert : existingConcerts) {
				if (concert.getTitle().contains("春季交響音樂會")) {
					hasSpringConcert = true;
					break;
				}
			}
			
			// 若無春季音樂會，則創建
			if (!hasSpringConcert) {
				createSpringConcert();
				return ResponseEntity.ok(new ApiResponse(true, "數據已檢查並自動創建：創建春季交響音樂會"));
			}
			
			return ResponseEntity.ok(new ApiResponse(true, "數據已檢查：所有必要的資料都存在"));
			
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(new ApiResponse(false, "數據檢查失敗: " + e.getMessage()));
		}
	}

	// 測試數據創建（開發階段）
	@GetMapping("/test-data")
	public ResponseEntity<ApiResponse> createTestData() {
		try {
			// 創建測試音樂會
			Concert concert = new Concert();
			concert.setTitle("貝多芬鋼琴妙境音樂會");
			concert.setDescription("一場精彩的貝多芬鋼琴演出，展現音樂的深邃與優雅");
			concert.setProgramDetails("第一部分: 月光奏鳴曲\n第二部分: 悲壯英雄\n第三部分: 田園交響曲");
			concert.setPosterUrl("/api/concerts/posters/beethoven.jpg");
			concert.setStatus("active");
			// 設置開始和結束時間
			LocalDateTime startTime = LocalDateTime.now().plusDays(14);
			LocalDateTime endTime = startTime.plusHours(2);
			concert.setStartDateTime(startTime);
			concert.setEndDateTime(endTime);
			concert.setCreatedAt(LocalDateTime.now());
			concert.setUpdatedAt(LocalDateTime.now());

			Concert savedConcert = concertRepository.save(concert);

			// 創建演出場次
			Performance performance = new Performance();
			performance.setConcert(savedConcert);
			performance.setStartTime(LocalDateTime.now().plusDays(30));
			performance.setEndTime(LocalDateTime.now().plusDays(30).plusHours(2));
			performance.setVenue("數位音樂廳主廳");
			performance.setStatus("scheduled");

			performanceRepository.save(performance);
			
			// 創建春季交響音樂會
			createSpringConcert();

			return ResponseEntity.ok(new ApiResponse(true, "測試數據創建成功"));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(new ApiResponse(false, "創建測試數據失敗: " + e.getMessage()));
		}
	}
	
	// 創建春季交響音樂會數據
	@GetMapping("/create-spring-concert")
	public ResponseEntity<ApiResponse> createSpringConcert() {
		try {
			// 創建春季交響音樂會
			Concert concert = new Concert();
			concert.setTitle("2025春季交響音樂會");
			concert.setDescription("春季音樂盛宴，將為您帶來優美的音樂體驗。由著名指揮家帶領交響樂團，演奏經典曲目和當代作品。");
			concert.setProgramDetails("貓與老鼠 - 幻想之舞\n柴可夫斯基 - 第五交響曲\n德布西 - 月光\n莫札特 - 小星星變奏曲");
			concert.setPosterUrl("/api/concerts/posters/spring-concert.jpg");
			concert.setStatus("active");
			concert.setCreatedAt(LocalDateTime.now());
			concert.setUpdatedAt(LocalDateTime.now());

			Concert savedConcert = concertRepository.save(concert);

			// 創建演出場次 - 使用固定的日期2025/5/15
			Performance performance = new Performance();
			performance.setConcert(savedConcert);
			performance.setStartTime(LocalDateTime.of(2025, 5, 15, 19, 30, 0));
			performance.setEndTime(LocalDateTime.of(2025, 5, 15, 21, 30, 0));
			performance.setVenue("數位音樂廳主廳");
			performance.setStatus("scheduled");

			performanceRepository.save(performance);

			return ResponseEntity.ok(new ApiResponse(true, "春季交響音樂會數據創建成功"));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(new ApiResponse(false, "創建春季交響音樂會數據失敗: " + e.getMessage()));
		}
	}

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
	@GetMapping("/{id}")
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

		// 設置第一個場次的時間和地點
		if (firstPerformance != null) {
			response.setStartTime(firstPerformance.getStartTime());
			response.setVenue(firstPerformance.getVenue());
		}

		response.setPerformanceCount(performances.size());

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

					return info;
				})
				.collect(Collectors.toList());

		response.setPerformances(performanceInfos);

		return response;
	}
}