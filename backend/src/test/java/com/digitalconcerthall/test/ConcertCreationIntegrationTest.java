package com.digitalconcerthall.test;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import com.digitalconcerthall.dto.request.ConcertRequest;
import com.digitalconcerthall.dto.request.LoginRequest;
import com.digitalconcerthall.dto.response.JwtResponse;
import com.digitalconcerthall.logging.LogExecutionTime;
import com.digitalconcerthall.logging.TestMethod;
import com.digitalconcerthall.logging.TestLoggingService;
import com.digitalconcerthall.model.concert.Concert;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;

/**
 * 集成測試示例 - 測試創建音樂會功能
 * 使用增強的日誌功能記錄測試過程
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "logging"})
public class ConcertCreationIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private TestLoggingService testLogger;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private String testId;
    private String authToken;
    private String baseUrl;
    
    @BeforeEach
    public void setUp() {
        baseUrl = String.format("http://localhost:%d", port);
        // 開始測試記錄
        testId = testLogger.startTest(
            "音樂會創建測試", 
            "測試管理員是否能成功創建音樂會，並驗證創建的音樂會數據是否正確",
            "api", "concert", "admin"
        );
        
        // 測試前獲取認證令牌
        loginAsAdmin();
    }
    
    /**
     * 自動測試方法
     */
    @Test
    @LogExecutionTime
    @TestMethod(description = "完整測試音樂會創建流程")
    public void testCreateConcert() throws Exception {
        try {
            // 記錄測試步驟
            testLogger.logTestStep(testId, "準備音樂會數據", "創建音樂會請求對象，包含必要的音樂會信息");
            
            // 準備測試數據
            ConcertRequest concertRequest = new ConcertRequest();
            concertRequest.setTitle("自動化測試音樂會");
            concertRequest.setDescription("這是一個由自動化測試創建的音樂會");
            concertRequest.setProgramDetails("第一部分：自動化組曲\n第二部分：測試協奏曲");
            concertRequest.setPosterUrl("https://example.com/poster.jpg");
            concertRequest.setBrochureUrl("https://example.com/brochure.pdf");
            concertRequest.setStatus("active");
            concertRequest.setStartDateTime(LocalDateTime.now().plusDays(1));
            concertRequest.setEndDateTime(LocalDateTime.now().plusDays(1).plusHours(2));
            
            // 記錄請求數據
            testLogger.logTestStep(testId, "發送創建請求", 
                    "向API發送POST請求，創建新音樂會\n請求數據: " + objectMapper.writeValueAsString(concertRequest));
            
            // 設置請求頭
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + authToken);
            
            // 創建請求實體
            HttpEntity<ConcertRequest> request = new HttpEntity<>(concertRequest, headers);
            
            // 發送請求並獲取響應
            String url = "http://localhost:" + port + "/api/admin/concerts";
            ResponseEntity<Concert> response = restTemplate.exchange(
                    url, HttpMethod.POST, request, Concert.class);
            
            // 記錄響應數據
            testLogger.logTestStep(testId, "接收創建響應", 
                    "接收API響應，狀態碼：" + response.getStatusCode() + 
                    "\n響應數據: " + objectMapper.writeValueAsString(response.getBody()));
            
            // 驗證響應狀態
            testLogger.logAssertion(testId, "驗證響應狀態碼", 
                    response.getStatusCode(), HttpStatus.OK, 
                    response.getStatusCode() == HttpStatus.OK);
            
            // 驗證音樂會數據
            Concert createdConcert = response.getBody();
            assertNotNull(createdConcert, "創建的音樂會不應為空");
            
            testLogger.logAssertion(testId, "驗證音樂會標題", 
                    createdConcert.getTitle(), concertRequest.getTitle(), 
                    createdConcert.getTitle().equals(concertRequest.getTitle()));
            
            testLogger.logAssertion(testId, "驗證音樂會描述", 
                    createdConcert.getDescription(), concertRequest.getDescription(), 
                    createdConcert.getDescription().equals(concertRequest.getDescription()));
            
            testLogger.logAssertion(testId, "驗證音樂會狀態", 
                    createdConcert.getStatus(), concertRequest.getStatus(), 
                    createdConcert.getStatus().equals(concertRequest.getStatus()));
            
            // 驗證日期時間字段不為空
            assertNotNull(createdConcert.getStartDateTime(), "音樂會開始時間不能為空");
            assertNotNull(createdConcert.getEndDateTime(), "音樂會結束時間不能為空");
            
            // 驗證結束時間在開始時間之後
            assertTrue(createdConcert.getEndDateTime().isAfter(createdConcert.getStartDateTime()),
                    "音樂會結束時間必須在開始時間之後");
            
            // 驗證日期時間
            testLogger.logAssertion(testId, "驗證音樂會開始時間", 
                    createdConcert.getStartDateTime().toString(), 
                    concertRequest.getStartDateTime().toString(), 
                    createdConcert.getStartDateTime().equals(concertRequest.getStartDateTime()));
            
            testLogger.logAssertion(testId, "驗證音樂會結束時間", 
                    createdConcert.getEndDateTime().toString(), 
                    concertRequest.getEndDateTime().toString(), 
                    createdConcert.getEndDateTime().equals(concertRequest.getEndDateTime()));
            
            // 如果ID存在，再次獲取音樂會數據並驗證
            if (createdConcert.getId() != null) {
                testLogger.logTestStep(testId, "獲取已創建的音樂會", 
                        "通過ID獲取剛創建的音樂會，以驗證數據已正確保存");
                
                String getUrl = "http://localhost:" + port + "/api/admin/concerts/" + createdConcert.getId();
                ResponseEntity<Concert> getResponse = restTemplate.exchange(
                        getUrl, HttpMethod.GET, new HttpEntity<>(headers), Concert.class);
                
                testLogger.logAssertion(testId, "驗證獲取的音樂會ID", 
                        getResponse.getBody().getId(), createdConcert.getId(), 
                        getResponse.getBody().getId().equals(createdConcert.getId()));
            }
            
            // 測試成功完成
            testLogger.endTest(testId, true, "音樂會創建測試成功完成");
            
        } catch (Exception e) {
            // 記錄測試錯誤
            testLogger.logTestError(testId, "測試過程中發生錯誤: " + e.getMessage(), e);
            testLogger.endTest(testId, false, "音樂會創建測試失敗: " + e.getMessage());
            throw e;
        }
    }
    
    /**
     * 登入為管理員並獲取令牌
     */
    private void loginAsAdmin() {
        try {
            testLogger.logTestStep(testId, "管理員登入", "使用管理員帳號登入系統，獲取JWT令牌");
            
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setIdentifier("admin@digitalconcert.com"); // 修改此處
            loginRequest.setPassword("admin123");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            String loginUrl = baseUrl + "/api/auth/signin";
            testLogger.logTestStep(testId, "發送登入請求", "請求URL: " + loginUrl);
            
            try {
                ResponseEntity<JwtResponse> response = restTemplate.postForEntity(
                    loginUrl,
                    new HttpEntity<>(loginRequest, headers),
                    JwtResponse.class
                );
                
                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    authToken = response.getBody().getAccessToken();
                    testLogger.logTestStep(testId, "管理員登入成功", "成功獲取JWT令牌");
                    
                    if (!response.getBody().getRoles().contains("ROLE_ADMIN")) {
                        throw new RuntimeException("用戶缺少管理員角色");
                    }
                } else {
                    throw new RuntimeException("登入失敗，狀態碼：" + response.getStatusCode());
                }
            } catch (Exception e) {
                String errorMsg = String.format("登入請求失敗 (URL: %s): %s", loginUrl, e.getMessage());
                testLogger.logTestError(testId, errorMsg, e);
                throw new RuntimeException(errorMsg);
            }
        } catch (Exception e) {
            testLogger.logTestError(testId, "管理員登入過程發生錯誤: " + e.getMessage(), e);
            fail("登入過程中發生錯誤: " + e.getMessage());
        }
    }
}
