package com.digitalconcerthall.dto.request;

import java.util.List;

public class CartRequest {
    private List<CartItemRequest> items;

    public List<CartItemRequest> getItems() {
        return items;
    }

    public void setItems(List<CartItemRequest> items) {
        this.items = items;
    }

    @Override
    public String toString() {
        return "CartRequest{" +
                "items=" + items +
                '}';
    }
}
