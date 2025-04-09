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
@CrossOrigin(origins = "*", maxAge = 3600)
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

			return ResponseEntity.ok(new ApiResponse(true, "測試數據創建成功"));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(new ApiResponse(false, "創建測試數據失敗: " + e.getMessage()));
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