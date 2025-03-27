package com.digitalconcerthall.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

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
        
        if ("1".equals(paymentStatus)) {
            // 更新訂單狀態為已支付
            orderService.updateOrderStatus(merchantTradeNo, "paid");
            
            // 產生票券
            ticketService.generateTicketsForOrder(merchantTradeNo);
        } else {
            // 更新訂單狀態為支付失敗
            orderService.updateOrderStatus(merchantTradeNo, "failed");
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
        
        Map<String, Object> response = new HashMap<>();
        response.put("orderNumber", merchantTradeNo);
        response.put("status", "1".equals(paymentStatus) ? "success" : "failed");
        
        if (!"1".equals(paymentStatus)) {
            response.put("message", returnParams.get("RtnMsg"));
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 測試支付結果通知 (模擬綠界回調，僅用於開發測試)
     */
    @PostMapping("/ecpay/test-notify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> testPaymentNotification(@RequestParam String orderNumber, @RequestParam boolean success) {
        Map<String, String> mockNotifyParams = new HashMap<>();
        mockNotifyParams.put("MerchantTradeNo", orderNumber);
        mockNotifyParams.put("RtnCode", success ? "1" : "0");
        
        if (success) {
            // 更新訂單狀態為已支付
            orderService.updateOrderStatus(orderNumber, "paid");
            
            // 產生票券
            ticketService.generateTicketsForOrder(orderNumber);
            
            return ResponseEntity.ok(new ApiResponse(true, "订单支付状态更新为成功"));
        } else {
            // 更新訂單狀態為支付失敗
            orderService.updateOrderStatus(orderNumber, "failed");
            
            return ResponseEntity.ok(new ApiResponse(true, "订单支付状态更新为失败"));
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
