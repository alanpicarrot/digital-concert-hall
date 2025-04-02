package com.digitalconcerthall.controller;

import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.digitalconcerthall.dto.response.ApiResponse;
import com.digitalconcerthall.exception.ResourceNotFoundException;
import com.digitalconcerthall.model.order.Order;
import com.digitalconcerthall.service.order.OrderService;
import com.digitalconcerthall.service.payment.ECPayService;
import com.digitalconcerthall.service.ticket.TicketService;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentController {
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private ECPayService ecPayService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private TicketService ticketService;

    /**
     * 初始化支付流程，返回包含綠界表單的HTML
     */
    @PostMapping(value = "/ecpay/create", produces = MediaType.TEXT_HTML_VALUE)
    @PreAuthorize("hasRole('USER')")
    public String createPayment(@RequestBody PaymentRequest request) {
        // 獲取訂單資訊 - 使用實體而非響應對象
        Order order = orderService.getOrderEntityByOrderNumber(request.getOrderNumber());
        
        if (order == null) {
            throw new ResourceNotFoundException("Order not found with order number: " + request.getOrderNumber());
        }
        
        // 整合商品名稱，如果有多個項目，用#分隔
        String itemName = order.getOrderItems().stream()
                           .map(item -> item.getTicket().getTicketType().getName() + " x " + item.getQuantity())
                           .collect(Collectors.joining("#"));
        
        if (itemName.length() > 200) {
            // 如果商品名稱過長，進行截斷
            itemName = itemName.substring(0, 197) + "...";
        }
        
        // 使用訂單編號和總額創建支付表單
        return ecPayService.createPaymentForm(
            order.getOrderNumber(),
            order.getTotalAmount().intValue(),
            itemName
        );
    }

    /**
     * 接收綠界的支付通知 (Server 端接收)
     */
    @PostMapping("/ecpay/notify")
    @Transactional
    public String handlePaymentNotification(@RequestParam Map<String, String> notifyParams) {
        // 判斷是否為測試模式
        boolean isTestMode = notifyParams.size() <= 2 && notifyParams.containsKey("RtnCode") && notifyParams.containsKey("MerchantTradeNo");
        
        // 非測試模式下，驗證通知來源
        if (!isTestMode && !ecPayService.verifyPaymentNotification(notifyParams)) {
            return "0|ErrorMessage";
        }
        
        // 處理支付結果
        String merchantTradeNo = notifyParams.get("MerchantTradeNo");
        String paymentStatus = notifyParams.get("RtnCode"); // 1 為交易成功
        
        // 記錄完整的通知參數
        logger.info("Received payment notification: {}", notifyParams);
        
        // 定義可能的訂單號格式
        List<String> possibleOrderNumbers = new ArrayList<>();
        
        // 添加原始訂單號
        possibleOrderNumbers.add(merchantTradeNo);
        
        // 如果是ORD前綴，嘗試DCH格式
        if (merchantTradeNo != null && merchantTradeNo.startsWith("ORD")) {
            String numericPart = merchantTradeNo.substring(3);
            possibleOrderNumbers.add("DCH-" + numericPart.substring(0, Math.min(numericPart.length(), 8)).toUpperCase());
        } 
        // 如果是DCH格式，嘗試ORD格式
        else if (merchantTradeNo != null && merchantTradeNo.startsWith("DCH-")) {
            String numericPart = merchantTradeNo.substring(4);
            possibleOrderNumbers.add("ORD" + numericPart);
        }
        
        // 記錄所有嘗試的格式
        logger.info("Trying order number formats: {}", possibleOrderNumbers);
        
        // 定義成功標記
        boolean orderFound = false;
        Order foundOrder = null;
        String foundOrderNumber = null;
        
        // 嘗試所有可能的訂單號格式
        for (String possibleOrderNumber : possibleOrderNumbers) {
            logger.info("Trying order number format: {}", possibleOrderNumber);
            try {
                foundOrder = orderService.getOrderEntityByOrderNumber(possibleOrderNumber);
                if (foundOrder != null) {
                    orderFound = true;
                    foundOrderNumber = possibleOrderNumber;
                    logger.info("Order found with number: {}", possibleOrderNumber);
                    break;
                }
            } catch (ResourceNotFoundException e) {
                logger.info("Order not found with number: {} - {}", possibleOrderNumber, e.getMessage());
            } catch (Exception e) {
                logger.error("Error checking order number: {} - {}", possibleOrderNumber, e.getMessage(), e);
            }
        }
        
        // 如果沒有找到訂單
        if (!orderFound || foundOrder == null) {
            logger.error("No matching order found for any format: {}", possibleOrderNumbers);
            // 即使訂單不存在，也回傳成功，避免綠界重複發送通知
            return "1|OK";
        }
        
        try {            
            if ("1".equals(paymentStatus)) {
                // 更新訂單狀態為已支付
                orderService.updateOrderStatus(foundOrderNumber, "paid");
                
                // 產生票券
                ticketService.generateTicketsForOrder(foundOrderNumber);
                
                // 記錄日誌
                logger.info("支付成功並完成訂單處理: {}", foundOrderNumber);
            } else {
                // 更新訂單狀態為支付失敗
                orderService.updateOrderStatus(foundOrderNumber, "failed");
                logger.info("支付失敗並更新訂單狀態: {}", foundOrderNumber);
            }
        } catch (Exception e) {
            logger.error("處理支付通知時發生錯誤: {}", e.getMessage(), e);
            // 即使出錯，也回傳成功，避免綠界重複發送通知
            return "1|OK";
        }
        
        // 回傳 1|OK 通知綠界處理成功
        return "1|OK";
    }

    /**
     * 處理支付完成後的前端導向 (Client 端接收)
     */
    @GetMapping("/ecpay/return")
    public ResponseEntity<Map<String, Object>> handlePaymentReturn(@RequestParam Map<String, String> returnParams) {
        String merchantTradeNo = returnParams.get("MerchantTradeNo");
        String paymentStatus = returnParams.get("RtnCode");
        
        logger.info("Payment return received: {}", returnParams);
        
        // 定義可能的訂單號格式
        List<String> possibleOrderNumbers = new ArrayList<>();
        
        // 添加原始訂單號
        possibleOrderNumbers.add(merchantTradeNo);
        
        // 如果是ORD前綴，嘗試DCH格式
        if (merchantTradeNo != null && merchantTradeNo.startsWith("ORD")) {
            String numericPart = merchantTradeNo.substring(3);
            possibleOrderNumbers.add("DCH-" + numericPart.substring(0, Math.min(numericPart.length(), 8)).toUpperCase());
        } 
        // 如果是DCH格式，嘗試ORD格式
        else if (merchantTradeNo != null && merchantTradeNo.startsWith("DCH-")) {
            String numericPart = merchantTradeNo.substring(4);
            possibleOrderNumbers.add("ORD" + numericPart);
        }
        
        // 定義成功標記
        boolean orderFound = false;
        String foundOrderNumber = merchantTradeNo;
        
        // 嘗試所有可能的訂單號格式
        for (String possibleOrderNumber : possibleOrderNumbers) {
            logger.info("Trying order number format in return: {}", possibleOrderNumber);
            try {
                Order order = orderService.getOrderEntityByOrderNumber(possibleOrderNumber);
                if (order != null) {
                    orderFound = true;
                    foundOrderNumber = possibleOrderNumber;
                    logger.info("Order found in return with number: {}", possibleOrderNumber);
                    break;
                }
            } catch (ResourceNotFoundException e) {
                // 微訊息層級，因為這是預期中的可能
                logger.info("Order not found in return with number: {}", possibleOrderNumber);
            } catch (Exception e) {
                // 維持為錯誤層級
                logger.error("Error checking order number in return: {}", possibleOrderNumber, e);
            }
        }
        
        // 用最終確定的訂單號設置回應
        Map<String, Object> response = new HashMap<>();
        response.put("orderNumber", foundOrderNumber);
        response.put("status", "1".equals(paymentStatus) ? "success" : "failed");
        
        // 如果是失敗狀態，添加錯誤訊息
        if (paymentStatus != null && !("1".equals(paymentStatus))) {
            response.put("message", returnParams.get("RtnMsg"));
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 測試支付結果通知 (模擬綠界回調，僅用於開發測試)
     */
    @PostMapping("/ecpay/test-notify")
    @CrossOrigin(origins = "*", maxAge = 3600)
    @Transactional
    public ResponseEntity<ApiResponse> testPaymentNotification(@RequestParam String orderNumber, @RequestParam boolean success) {
        logger.info("Received test payment notification: orderNumber={}, success={}", orderNumber, success);
        
        // 定義切換訂單號的所有可能格式
        List<String> possibleOrderNumbers = new ArrayList<>();
        
        // 添加原始訂單號
        possibleOrderNumbers.add(orderNumber);
        
        // 如果是ORD前綴，嘗試為DCH格式
        if (orderNumber.startsWith("ORD")) {
            String numericPart = orderNumber.substring(3);
            possibleOrderNumbers.add("DCH-" + numericPart.substring(0, Math.min(numericPart.length(), 8)).toUpperCase());
        } 
        // 如果是DCH格式，嘗試ORD格式
        else if (orderNumber.startsWith("DCH-")) {
            String numericPart = orderNumber.substring(4);
            possibleOrderNumbers.add("ORD" + numericPart);
        }
        
        // 定義成功標記
        boolean orderFound = false;
        Order foundOrder = null;
        String foundOrderNumber = null;
        
        // 失敗訊息
        StringBuilder errorMessages = new StringBuilder();
        
        // 嘗試所有可能的訂單號格式
        for (String possibleOrderNumber : possibleOrderNumbers) {
            logger.info("Trying order number format: {}", possibleOrderNumber);
            try {
                foundOrder = orderService.getOrderEntityByOrderNumber(possibleOrderNumber);
                if (foundOrder != null) {
                    orderFound = true;
                    foundOrderNumber = possibleOrderNumber;
                    logger.info("Order found with number: {}", possibleOrderNumber);
                    break;
                }
            } catch (ResourceNotFoundException e) {
                errorMessages.append("\n").append(possibleOrderNumber).append(": ").append(e.getMessage());
                logger.info("Order not found with number: {} - {}", possibleOrderNumber, e.getMessage());
            } catch (Exception e) {
                errorMessages.append("\n").append(possibleOrderNumber).append(": ").append(e.getMessage());
                logger.error("Error checking order number: {} - {}", possibleOrderNumber, e.getMessage(), e);
            }
        }
        
        // 如果沒有找到訂單，返回錯誤
        if (!orderFound || foundOrder == null) {
            String errorMsg = "無法找到匹配的訂單: " + orderNumber + errorMessages.toString();
            logger.error(errorMsg);
            return ResponseEntity.badRequest().body(new ApiResponse(false, errorMsg));
        }
        
        try {
            Map<String, String> mockNotifyParams = new HashMap<>();
            mockNotifyParams.put("MerchantTradeNo", foundOrderNumber);
            mockNotifyParams.put("RtnCode", success ? "1" : "0");
            
            if (success) {
                // 更新訂單狀態為已支付
                orderService.updateOrderStatus(foundOrderNumber, "paid");
                
                // 產生票券
                ticketService.generateTicketsForOrder(foundOrderNumber);
                
                logger.info("測試模式: 支付成功並完成訂單處理: {}", foundOrderNumber);
                return ResponseEntity.ok(new ApiResponse(true, "订单支付状态更新为成功"));
            } else {
                // 更新訂單狀態為支付失敗
                orderService.updateOrderStatus(foundOrderNumber, "failed");
                
                logger.info("測試模式: 支付失敗並更新訂單狀態: {}", foundOrderNumber);
                return ResponseEntity.ok(new ApiResponse(true, "订单支付状态更新为失败"));
            }
        } catch (Exception e) {
            String errorMsg = "處理支付通知時發生錯誤: " + e.getMessage();
            logger.error(errorMsg, e);
            return ResponseEntity.badRequest().body(new ApiResponse(false, errorMsg));
        }
    }
    
    /**
     * 模擬支付 - 用於開發環境，直接完成支付流程
     */
    @PostMapping("/mock-payment")
    @CrossOrigin(origins = "*", maxAge = 3600)
    @Transactional
    public ResponseEntity<ApiResponse> mockPayment(@RequestParam String orderNumber) {
        try {
            logger.info("模擬支付請求: 訂單號 {}", orderNumber);
            
            // 定義可能的訂單號格式
            List<String> possibleOrderNumbers = new ArrayList<>();
            
            // 添加原始訂單號
            possibleOrderNumbers.add(orderNumber);
            
            // 如果是ORD前綴，嘗試DCH格式
            if (orderNumber != null && orderNumber.startsWith("ORD")) {
                String numericPart = orderNumber.substring(3);
                possibleOrderNumbers.add("DCH-" + numericPart.substring(0, Math.min(numericPart.length(), 8)).toUpperCase());
            } 
            // 如果是DCH格式，嘗試ORD格式
            else if (orderNumber != null && orderNumber.startsWith("DCH-")) {
                String numericPart = orderNumber.substring(4);
                possibleOrderNumbers.add("ORD" + numericPart);
            }
            
            // 定義成功標記
            boolean orderFound = false;
            Order foundOrder = null;
            String foundOrderNumber = null;
            
            // 嘗試所有可能的訂單號格式
            for (String possibleOrderNumber : possibleOrderNumbers) {
                logger.info("Trying order number format in mock payment: {}", possibleOrderNumber);
                try {
                    foundOrder = orderService.getOrderEntityByOrderNumber(possibleOrderNumber);
                    if (foundOrder != null) {
                        orderFound = true;
                        foundOrderNumber = possibleOrderNumber;
                        logger.info("Order found in mock payment with number: {}", possibleOrderNumber);
                        break;
                    }
                } catch (ResourceNotFoundException e) {
                    logger.info("Order not found in mock payment with number: {}", possibleOrderNumber);
                } catch (Exception e) {
                    logger.error("Error checking order number in mock payment: {}", possibleOrderNumber, e);
                }
            }
            
            // 如果沒有找到訂單，返回錯誤
            if (!orderFound || foundOrder == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "訂單不存在"));
            }
            
            // 更新訂單狀態
            orderService.updateOrderStatus(foundOrderNumber, "paid");
            
            // 生成票券
            ticketService.generateTicketsForOrder(foundOrderNumber);
            
            logger.info("模擬支付成功: 訂單號 {}, 已生成票券", foundOrderNumber);
            
            return ResponseEntity.ok(new ApiResponse(true, "支付模擬成功"));
        } catch (Exception e) {
            logger.error("模擬支付失敗: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new ApiResponse(false, "支付模擬失敗: " + e.getMessage()));
        }
    }
}

class PaymentRequest {
    private String orderNumber;

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }
}