package com.swiftpos;

import com.swiftpos.dto.SaleItemRequest;
import com.swiftpos.dto.SaleRequest;
import com.swiftpos.entity.Product;
import com.swiftpos.entity.Sale;
import com.swiftpos.repository.ProductRepository;
import com.swiftpos.service.SaleService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class SaleServiceTest {

    @Autowired
    private SaleService saleService;

    @Autowired
    private ProductRepository productRepository;

    @Test
    void testProcessSaleInsufficientStockThrowsException() {
        SaleRequest request = new SaleRequest();
        request.setCashierId(1L);
        request.setPaymentMethod("CASH");

        SaleItemRequest item = new SaleItemRequest();
        item.setProductId(1L);
        item.setQuantity(999999); // Way above stock
        request.setItems(List.of(item));

        assertThrows(RuntimeException.class, () -> {
            saleService.processSale(request);
        });
    }

    @Test
    void testProcessSaleEmptyItemsThrowsException() {
        SaleRequest request = new SaleRequest();
        request.setCashierId(1L);
        request.setPaymentMethod("CASH");
        request.setItems(List.of());

        assertThrows(IllegalArgumentException.class, () -> {
            saleService.processSale(request);
        });
    }
}
