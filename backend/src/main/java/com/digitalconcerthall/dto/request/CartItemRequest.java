package com.digitalconcerthall.dto.request;

public class CartItemRequest {
    private String id;
    private String type;
    private int quantity;
    private double price;
    private String name;
    private String image;
    private String date;

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
    
    @Override
    public String toString() {
        return "CartItemRequest{" +
                "id='" + id + '\'' +
                ", type='" + type + '\'' +
                ", quantity=" + quantity +
                ", price=" + price +
                ", name='" + name + '\'' +
                ", image='" + image + '\'' +
                ", date=" + date +
                '}';
    }
}
