# 前後端整合對話記錄

## 初始問題

根據附件到這個專案路徑開發與除錯：/Users/alanp/digital-concert-hall/backend/src/main/java/com/digitalconcerthall/controller/TicketController.java
我的需求是，目前這個後端的控制器提供給frontend-admin索取票券訊息，但是還沒有給frontend-client取得票券訊息，因為購票前台跟管理後台應該取得一樣的資料，所以我希望這個控制器程式可以同時實作上述兩個功能。如果有更好的建議，可以提供給我。

## 問題診斷

我檢查了錯誤信息，看到在嘗試訪問 `/api/performances/1/tickets` 時出現了500錯誤，顯示 "ERR_BAD_RESPONSE"。通過查看現有代碼，我發現需要為前端客戶端創建一個新的控制器來提供票券信息。

## 後端代碼實現

我創建了新的 `ClientTicketController` 類來處理前端客戶端的票券請求：

```java
package com.digitalconcerthall.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.response.ticket.TicketTypeClientResponse;
import com.digitalconcerthall.repository.ticket.TicketRepository;
import com.digitalconcerthall.repository.ticket.TicketTypeRepository;
import com.digitalconcerthall.model.ticket.Ticket;
import com.digitalconcerthall.model.ticket.TicketType;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 客戶端票券控制器
 * 處理前台客戶查詢票券相關的請求
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class ClientTicketController {
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private TicketTypeRepository ticketTypeRepository;
    
    /**
     * 根據演出場次ID獲取可購買的票券列表
     * @param performanceId 演出場次ID
     * @return 票券列表
     */
    @GetMapping("/performances/{performanceId}/tickets")
    public ResponseEntity<List<TicketTypeClientResponse>> getTicketsByPerformanceId(
            @PathVariable("performanceId") Long performanceId) {
        
        List<Ticket> tickets = ticketRepository.findByPerformanceId(performanceId);
        
        List<TicketTypeClientResponse> responses = tickets.stream()
                .filter(ticket -> ticket.getAvailableQuantity() > 0) // 只返回有庫存的票券
                .map(ticket -> {
                    TicketType ticketType = ticket.getTicketType();
                    
                    TicketTypeClientResponse response = new TicketTypeClientResponse();
                    response.setId(ticket.getId());
                    response.setTicketTypeId(ticketType.getId());
                    response.setName(ticketType.getName());
                    response.setDescription(ticketType.getDescription());
                    response.setPrice(ticketType.getPrice());
                    response.setColorCode(ticketType.getColorCode());
                    response.setAvailableQuantity(ticket.getAvailableQuantity());
                    response.setPerformanceId(performanceId);
                    
                    return response;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    /**
     * 獲取票券詳情
     * @param ticketId 票券ID
     * @return 票券詳情
     */
    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<TicketTypeClientResponse> getTicketById(
            @PathVariable("ticketId") Long ticketId) {
        
        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    TicketType ticketType = ticket.getTicketType();
                    
                    TicketTypeClientResponse response = new TicketTypeClientResponse();
                    response.setId(ticket.getId());
                    response.setTicketTypeId(ticketType.getId());
                    response.setName(ticketType.getName());
                    response.setDescription(ticketType.getDescription());
                    response.setPrice(ticketType.getPrice());
                    response.setColorCode(ticketType.getColorCode());
                    response.setAvailableQuantity(ticket.getAvailableQuantity());
                    response.setPerformanceId(ticket.getPerformance().getId());
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * 獲取所有票種
     * @return 票種列表
     */
    @GetMapping("/ticket-types")
    public ResponseEntity<List<TicketType>> getAllTicketTypes() {
        return ResponseEntity.ok(ticketTypeRepository.findAll());
    }
}
```

同時創建了相應的DTO類：

```java
package com.digitalconcerthall.dto.response.ticket;

import java.math.BigDecimal;

/**
 * 前端客戶端票券類型響應DTO
 * 用於向前端客戶返回票券類型相關信息
 */
public class TicketTypeClientResponse {
    
    private Long id;
    private Long ticketTypeId;
    private String name;
    private String description;
    private BigDecimal price;
    private String colorCode;
    private Integer availableQuantity;
    private Long performanceId;
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getTicketTypeId() {
        return ticketTypeId;
    }
    
    public void setTicketTypeId(Long ticketTypeId) {
        this.ticketTypeId = ticketTypeId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public String getColorCode() {
        return colorCode;
    }
    
    public void setColorCode(String colorCode) {
        this.colorCode = colorCode;
    }
    
    public Integer getAvailableQuantity() {
        return availableQuantity;
    }
    
    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }
    
    public Long getPerformanceId() {
        return performanceId;
    }
    
    public void setPerformanceId(Long performanceId) {
        this.performanceId = performanceId;
    }
}
```

## 前端整合

更新了前端的 `ticketService.js` 文件，使其適配新的API：

```javascript
// 根據演出場次ID獲取可用票券
const getTicketsByPerformance = async (performanceId) => {
  try {
    const path = validateApiPath(`${API_PERFORMANCES_PATH}/${performanceId}/tickets`);
    const response = await publicAxios.get(path);
    
    // 將API返回的數據轉換為前端期望的格式
    const ticketsData = response.data;
    
    if (Array.isArray(ticketsData)) {
      return ticketsData.map(ticket => ({
        id: ticket.id,
        ticketType: {
          id: ticket.ticketTypeId,
          name: ticket.name,
          description: ticket.description,
          price: ticket.price,
          colorCode: ticket.colorCode || '#4f46e5' // 使用票券顏色代碼或預設值
        },
        price: ticket.price,
        availableQuantity: ticket.availableQuantity,
        performance: {
          id: ticket.performanceId,
          // 注意：這些欄位可能需要從其他API獲取
          startTime: null, // 需從performance中獲取
          endTime: null,   // 需從performance中獲取
          venue: null,     // 需從performance中獲取
          concertId: null  // 需從performance中獲取
        }
      }));
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching tickets by performance:', error);
    
    // 模擬數據，服務器端API尚未實現或出錯時使用
    console.log('使用模擬演出場次票券數據');
    
    // 為演出場次提供兩種票券類型的模擬數據
    const mockTickets = [
      // ... 模擬數據
    ];
    
    return mockTickets;
  }
};
```

也更新了票券詳情獲取方法：

```javascript
// 根據ID獲取特定票券詳情（無需登入）
const getTicketById = async (ticketId) => {
  try {
    const path = validateApiPath(`${API_PUBLIC_TICKETS_PATH}/${ticketId}`);
    const response = await publicAxios.get(path);
    
    // 轉換API返回的數據為前端期望的格式
    const ticketData = response.data;
    
    // 構建回應格式
    const formattedTicket = {
      id: ticketData.id,
      ticketType: {
        id: ticketData.ticketTypeId,
        name: ticketData.name,
        description: ticketData.description,
        price: ticketData.price,
        colorCode: ticketData.colorCode || '#4f46e5' // 使用票券顏色代碼或預設值
      },
      price: ticketData.price,
      availableQuantity: ticketData.availableQuantity,
      performance: {
        id: ticketData.performanceId,
        // 注意：這些欄位可能需要從其他API獲取
        startTime: null, // 需要從performance API中獲取
        endTime: null,   // 需要從performance API中獲取
        venue: null,     // 需要從performance API中獲取
        concertId: null  // 需要從performance API中獲取
      }
    };
    
    // 獲取演出場次信息來完善票券信息
    try {
      const performancePath = validateApiPath(`${API_PERFORMANCES_PATH}/${ticketData.performanceId}`);
      const performanceResponse = await publicAxios.get(performancePath);
      const performanceData = performanceResponse.data;
      
      formattedTicket.performance.startTime = performanceData.startTime;
      formattedTicket.performance.endTime = performanceData.endTime;
      formattedTicket.performance.venue = performanceData.venue;
      formattedTicket.performance.concertId = performanceData.concertId;
    } catch (perfError) {
      console.error('Error fetching performance data:', perfError);
    }
    
    return formattedTicket;
  } catch (error) {
    console.error('Error fetching ticket by ID:', error);
    
    // 模擬數據，服務器端API尚未實現或出錯時使用
    console.log('使用模擬票券數據');
    
    // 這裡可以根據測試數據中記錄的票種，提供模擬數據
    const mockTicket = {
      // ... 模擬數據
    };
    
    return mockTicket;
  }
};
```

更新了 `PerformanceTicketsPage.jsx` 組件，使其能夠處理新的數據結構：

```jsx
// 獲取該演出場次的所有可用票券
const ticketsData = await ticketService.getTicketsByPerformance(id);

// 如果票券數據中沒有完整的演出場次信息，需要進行補充
if (Array.isArray(ticketsData) && ticketsData.length > 0) {
  const enhancedTickets = ticketsData.map(ticket => {
    // 確保演出場次信息完整
    if (ticket.performance && (!ticket.performance.startTime || !ticket.performance.venue)) {
      // 將演出場次資訊填充到票券中
      return {
        ...ticket,
        performance: {
          ...ticket.performance,
          startTime: performanceData.startTime,
          endTime: performanceData.endTime,
          venue: performanceData.venue,
          concertId: performanceData.concertId
        }
      };
    }
    return ticket;
  });
  setTickets(enhancedTickets);
} else {
  setTickets(ticketsData || []);
}
```

並且更新了票券顯示部分：

```jsx
{tickets.map((ticket) => {
  // 處理新的API返回格式
  const ticketName = ticket.ticketType?.name || ticket.name;
  const ticketDescription = ticket.ticketType?.description || ticket.description || '標準票種，良好的視聽體驗';
  const ticketPrice = ticket.price;
  const availableQuantity = ticket.availableQuantity;
  
  return (
    <div
      key={ticket.id}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold">{ticketName}</h3>
          <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
            NT$ {ticketPrice}
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 h-12">
          {ticketDescription}
        </p>
        
        <div className="text-sm text-gray-500 mb-4">
          剩餘數量: <span className="font-medium">{availableQuantity} 張</span>
        </div>
        
        <Link
          to={`/tickets/${ticket.id}?type=${encodeURIComponent(ticketName)}`}
          className="block w-full py-2 bg-indigo-600 text-white rounded-lg text-center hover:bg-indigo-700 transition"
        >
          選擇此票種
        </Link>
      </div>
    </div>
  );
})}
```

## 需要後續處理的事項

1. 重啟後端服務，使新的控制器生效
2. 測試前端能否順利獲取票券信息
3. 考慮進一步優化API設計，例如讓後端直接返回完整的票券信息，減少前端請求次數
4. 可以考慮設計更統一的數據返回格式，使前後端整合更加簡單

## 建議與改進方向

1. 考慮實現共享的票券服務層，服務於前台和後台
2. 實施API版本控制，以便未來升級
3. 統一API返回格式
4. 增加更豐富的票券篩選功能
5. 實現票券庫存即時更新功能
