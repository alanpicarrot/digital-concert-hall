package com.digitalconcerthall.service;

import com.digitalconcerthall.dto.response.ConcertResponse;
import com.digitalconcerthall.model.concert.Concert;
import com.digitalconcerthall.model.ticket.TicketType;
import com.digitalconcerthall.model.concert.Performance;
import com.digitalconcerthall.repository.concert.ConcertRepository; // 假設你有 ConcertRepository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 建議用於讀取操作

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ConcertService {

    @Autowired
    private ConcertRepository concertRepository; // 注入你的 Concert Repository

    /**
     * 獲取所有音樂會列表，包含詳細的場次和價格範圍信息。
     * @return ConcertResponse 列表
     */
    @Transactional(readOnly = true) // 建議對讀取操作使用事務註解
    public List<ConcertResponse> getAllConcertsWithDetails() {
        List<Concert> concerts = concertRepository.findAll(); // 從數據庫獲取所有 Concert 實體
        // 將每個 Concert 實體映射到 ConcertResponse DTO
        return concerts.stream()
                .map(this::mapToConcertResponse)
                .collect(Collectors.toList());
    }

    // --- 你可能還需要類似的方法來獲取即將上演或過去的音樂會 ---
    // 例如：getUpcomingConcertsWithDetails(), getPastConcertsWithDetails()
    // 這些方法可以調用 concertRepository 的自定義查詢，然後同樣使用 mapToConcertResponse

    /**
     * 將 Concert 實體映射到 ConcertResponse DTO，包含計算價格和收集場次信息。
     * @param concert Concert 實體
     * @return ConcertResponse DTO
     */
    private ConcertResponse mapToConcertResponse(Concert concert) {
        // 從 Concert 實體獲取關聯的 Performance 列表
        // 使用 new ArrayList 包裹以確保列表是可修改的（如果需要排序）
        List<Performance> performances = new ArrayList<>(concert.getPerformances());

        // 按開始時間對場次進行排序（可選，但通常是好的做法）
        performances.sort(Comparator.comparing(Performance::getStartTime, Comparator.nullsLast(Comparator.naturalOrder())));

        // --- 計算最低和最高票價 ---
        BigDecimal minPrice = null;
        BigDecimal maxPrice = null;

        // 遍歷所有場次
        for (Performance performance : performances) {
            // 遍歷該場次的所有票券類型
            if (performance.getTicketTypes() != null) { // 添加 null 檢查
                for (TicketType ticketType : performance.getTicketTypes()) {
                    BigDecimal currentPrice = ticketType.getPrice();
                    // 確保票價不為 null
                    if (currentPrice != null) {
                        // 更新最低價
                        if (minPrice == null || currentPrice.compareTo(minPrice) < 0) {
                            minPrice = currentPrice;
                        }
                        // 更新最高價
                        if (maxPrice == null || currentPrice.compareTo(maxPrice) > 0) {
                            maxPrice = currentPrice;
                        }
                    }
                }
            }
        }

        // --- 收集所有場次的開始時間和地點 ---
        List<LocalDateTime> startTimes = performances.stream()
                .map(Performance::getStartTime)
                .filter(Objects::nonNull) // 過濾掉 null 的時間
                .collect(Collectors.toList());

        List<String> venues = performances.stream()
                .map(Performance::getVenue)
                .filter(Objects::nonNull) // 過濾掉 null 的地點
                .collect(Collectors.toList());

        // --- 創建並填充 ConcertResponse DTO ---
        ConcertResponse dto = new ConcertResponse();
        dto.setId(concert.getId());
        dto.setTitle(concert.getTitle());
        dto.setDescription(concert.getDescription());
        dto.setProgramDetails(concert.getProgramDetails());
        dto.setPosterUrl(concert.getPosterUrl());
        dto.setBrochureUrl(concert.getBrochureUrl());
        // 直接使用 String 類型的 status
        dto.setStatus(concert.getStatus());
        dto.setPerformanceCount(performances.size());
        dto.setMinPrice(minPrice); // 設置計算出的最低票價
        dto.setMaxPrice(maxPrice); // 設置計算出的最高票價
        dto.setStartTimes(startTimes); // 設置收集到的所有開始時間
        dto.setVenues(venues); // 設置收集到的所有地點

        return dto;
    }

    // --- 你可能還需要根據 ID 獲取單個音樂會詳細信息的方法 ---
    // 例如：getConcertDetailsById(Long id)
    // 這個方法可能需要返回一個更詳細的 DTO，或者直接返回 Concert 實體（取決於你的架構）
    // 如果返回 DTO，它也可能調用類似 mapToConcertResponse 的邏輯，或者一個更詳細的映射方法

}