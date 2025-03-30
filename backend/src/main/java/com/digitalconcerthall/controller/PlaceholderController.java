package com.digitalconcerthall.controller;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import javax.imageio.ImageIO;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/placeholder")
public class PlaceholderController {

    /**
     * 生成指定寬高的占位圖片
     * 
     * @param width 圖片寬度
     * @param height 圖片高度
     * @return 圖片數據
     */
    @GetMapping(value = "/{width}/{height}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getPlaceholderImage(
            @PathVariable("width") int width,
            @PathVariable("height") int height,
            @org.springframework.web.bind.annotation.RequestParam(value = "text", required = false) String customText) {
        
        // 記錄該請求，以便於調試
        System.out.println("Placeholder image requested: " + width + "x" + height + ", text: " + customText);
        
        // 設置圖片最大限制，防止請求過大圖片導致服務器壓力
        int maxWidth = 2000;
        int maxHeight = 2000;
        
        if (width > maxWidth) width = maxWidth;
        if (height > maxHeight) height = maxHeight;
        
        // 創建圖片
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = image.createGraphics();
        
        // 填充背景色
        g2d.setColor(new Color(204, 204, 204)); // 淺灰色背景
        g2d.fillRect(0, 0, width, height);
        
        // 繪製邊框
        g2d.setColor(new Color(153, 153, 153)); // 深灰色邊框
        g2d.drawRect(0, 0, width - 1, height - 1);
        
        // 繪製文字
        String text = (customText != null && !customText.trim().isEmpty()) 
            ? customText 
            : width + " × " + height;
        
        // 根據文字長度調整字體大小
        int fontSize = Math.min(width, height) / 8;
        if (text.length() > 10) {
            fontSize = Math.max(12, fontSize * 10 / text.length());
        }
        Font font = new Font("Arial", Font.BOLD, fontSize);
        g2d.setFont(font);
        
        // 計算文字位置以便置中
        int textWidth = g2d.getFontMetrics().stringWidth(text);
        int textHeight = g2d.getFontMetrics().getHeight();
        
        g2d.setColor(new Color(51, 51, 51)); // 深色文字
        g2d.drawString(text, (width - textWidth) / 2, (height + textHeight / 2) / 2);
        
        g2d.dispose();
        
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            byte[] imageData = baos.toByteArray();
            
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .header("Cache-Control", "public, max-age=86400") // 快取 24 小時
                    .body(imageData);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new byte[0]);
        }
    }
}
