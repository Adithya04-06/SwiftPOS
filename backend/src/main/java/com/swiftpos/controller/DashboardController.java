package com.swiftpos.controller;

import com.swiftpos.entity.Product;
import com.swiftpos.entity.Sale;
import com.swiftpos.repository.ProductRepository;
import com.swiftpos.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class DashboardController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SaleRepository saleRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Product> products = productRepository.findAll();
        List<Sale> sales = saleRepository.findAll();

        long totalProducts = products.size();
        long totalStock = products.stream()
                .mapToLong(p -> p.getStock() != null ? p.getStock() : 0)
                .sum();
        
        List<Product> lowStockItems = products.stream()
                .filter(p -> p.getStock() != null && p.getMinimumStock() != null && p.getStock() <= p.getMinimumStock())
                .collect(Collectors.toList());

        long totalTransactions = sales.size();
        
        LocalDate today = LocalDate.now();
        BigDecimal todaysSales = sales.stream()
                .filter(s -> s.getDate() != null && s.getDate().toLocalDate().isEqual(today))
                .map(Sale::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Recent sales (top 5)
        List<Sale> recentSales = sales.stream()
                .sorted((s1, s2) -> {
                    if (s1.getDate() == null && s2.getDate() == null) return 0;
                    if (s1.getDate() == null) return 1;
                    if (s2.getDate() == null) return -1;
                    return s2.getDate().compareTo(s1.getDate());
                })
                .limit(5)
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("totalStock", totalStock);
        stats.put("todaysSales", todaysSales != null ? todaysSales : BigDecimal.ZERO);
        stats.put("totalTransactions", totalTransactions);
        stats.put("lowStockItems", lowStockItems);
        stats.put("recentSales", recentSales);

        return ResponseEntity.ok(stats);
    }
}
