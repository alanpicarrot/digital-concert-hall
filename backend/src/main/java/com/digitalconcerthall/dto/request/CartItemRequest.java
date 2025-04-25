package com.digitalconcerthall.dto.request;

public class CartItemRequest {
    private String id;          // 票券ID，保存為字串但可轉換為數字
    private String type;        // 票券類型
    private int quantity;       // 數量
    private double price;       // 價格
    private String name;        // 名稱
    private String image;       // 圖片路徑
    private String date;        // 日期
    private Long concertId;     // 音樂會ID

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
    
    public Long getConcertId() {
        return concertId;
    }
    
    public void setConcertId(Long concertId) {
        this.concertId = concertId;
    }
    
    @Override
    public String toString() {
        return "CartItemRequest{" +
                "id='" + id + '\'' +
                ", type='" + type + '\'' +
                ", quantity=" + quantity +
                ", price=" + price +
                ", name='" + name + '\'' +
                ", image='" + image + '\'' +
                ", date='" + date + '\'' +
                ", concertId=" + concertId +
                '}';
    }
}