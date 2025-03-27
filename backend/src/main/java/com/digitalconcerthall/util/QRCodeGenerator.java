package com.digitalconcerthall.util;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

import org.springframework.stereotype.Component;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

/**
 * QR碼生成工具類
 */
@Component
public class QRCodeGenerator {
    
    /**
     * 生成QR碼並返回Base64編碼的圖像字符串
     *
     * @param text QR碼包含的文本內容
     * @param width QR碼寬度
     * @param height QR碼高度
     * @return Base64編碼的QR碼圖像
     */
    public String generateQRCodeBase64(String text, int width, int height) {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix;
        
        try {
            bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            
            byte[] imageBytes = outputStream.toByteArray();
            return Base64.getEncoder().encodeToString(imageBytes);
            
        } catch (WriterException | IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
