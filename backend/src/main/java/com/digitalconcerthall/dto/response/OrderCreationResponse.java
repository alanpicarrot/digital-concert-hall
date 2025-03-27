package com.digitalconcerthall.dto.response;

public class OrderCreationResponse {
    private String orderNumber;
    private String status;
    private double totalAmount;
    private String message;
    
    public OrderCreationResponse() {
    }
    
    /**
     * 成功建立訂單時使用的建構函數
     * @param orderNumber 訂單編號
     * @param status 訂單狀態
     * @param totalAmount 訂單金額
     */
    public OrderCreationResponse(String orderNumber, String status, double totalAmount) {
        this.orderNumber = orderNumber;
        this.status = status;
        this.totalAmount = totalAmount;
    }
    
    /**
     * 建立含有錯誤訊息的響應物件
     * @param status 訂單狀態
     * @param errorMessage 錯誤訊息
     */
    public OrderCreationResponse(String status, String errorMessage) {
        this.status = status;
        this.message = errorMessage;
        this.totalAmount = 0.0; // 預設價格為0
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}
