package com.swiftpos.service;

import com.swiftpos.dto.SaleItemRequest;
import com.swiftpos.dto.SaleRequest;
import com.swiftpos.entity.Product;
import com.swiftpos.entity.Sale;
import com.swiftpos.entity.SaleItem;
import com.swiftpos.entity.User;
import com.swiftpos.repository.ProductRepository;
import com.swiftpos.repository.SaleItemRepository;
import com.swiftpos.repository.SaleRepository;
import com.swiftpos.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private SaleItemRepository saleItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Sale> getAllSales() {
        return saleRepository.findAllByOrderByDateDesc();
    }

    public Sale getSaleById(Long id) {
        return saleRepository.findById(id).orElse(null);
    }
    
    public List<SaleItem> getSaleItemsBySaleId(Long saleId) {
        return saleItemRepository.findBySaleId(saleId);
    }

    @Transactional
    public Sale processSale(SaleRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Sale must contain at least one item.");
        }

        User cashier = null;
        if (request.getCashierId() != null) {
            cashier = userRepository.findById(request.getCashierId()).orElse(null);
        }
        if (cashier == null) {
            cashier = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No cashier available in the system."));
        }

        // Validate stock upfront for all items before any modifications
        for (SaleItemRequest itemReq : request.getItems()) {
            if (itemReq.getProductId() == null) {
                throw new IllegalArgumentException("Product ID cannot be null.");
            }
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than zero.");
            }
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.getProductId()));
            if (product.getStock() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName() 
                        + " (Available: " + product.getStock() + ", Requested: " + itemReq.getQuantity() + ")");
            }
        }

        Sale sale = new Sale();
        sale.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        sale.setDate(LocalDateTime.now());
        sale.setCashier(cashier);
        sale.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH");
        sale.setStatus("COMPLETED");

        BigDecimal subtotalSum = BigDecimal.ZERO;

        // Initial save to obtain sale ID
        sale.setTotal(BigDecimal.ZERO);
        sale = saleRepository.save(sale);

        for (SaleItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId()).get();

            // Deduct stock
            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);

            // Create Sale Item
            SaleItem saleItem = new SaleItem();
            saleItem.setSale(sale);
            saleItem.setProduct(product);
            saleItem.setQuantity(itemReq.getQuantity());
            saleItem.setPrice(product.getPrice());
            
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            saleItem.setSubtotal(subtotal);
            subtotalSum = subtotalSum.add(subtotal);
            
            saleItemRepository.save(saleItem);
        }

        // Apply 5% tax to align with frontend POS calculation and receipt math
        BigDecimal tax = subtotalSum.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotalSum.add(tax).setScale(2, RoundingMode.HALF_UP);
        sale.setTotal(total);

        return saleRepository.save(sale);
    }
}
