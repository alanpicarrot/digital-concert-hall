package com.digitalconcerthall.service.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.digitalconcerthall.dto.response.order.OrderSummaryResponse;
import com.digitalconcerthall.model.order.Order;

public interface OrderService {
    
    /**
     * 獲取當前登錄用戶的所有訂單
     * @param pageable 分頁參數
     * @return 訂單列表（分頁）
     */
    Page<OrderSummaryResponse> getCurrentUserOrders(Pageable pageable);
    
    /**
     * 根據訂單編號獲取訂單詳情
     * @param orderNumber 訂單編號
     * @return 訂單詳情
     */
    OrderSummaryResponse getOrderByOrderNumber(String orderNumber);
    
    /**
     * 根據訂單編號獲取訂單實體
     * @param orderNumber 訂單編號
     * @return 訂單實體
     */
    Order getOrderEntityByOrderNumber(String orderNumber);
    
    /**
     * 更新訂單狀態
     * @param orderNumber 訂單編號
     * @param status 新狀態
     * @return 是否更新成功
     */
    boolean updateOrderStatus(String orderNumber, String status);
}
