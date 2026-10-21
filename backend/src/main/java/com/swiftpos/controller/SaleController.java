package com.swiftpos.controller;

import com.swiftpos.dto.SaleRequest;
import com.swiftpos.entity.Sale;
import com.swiftpos.entity.SaleItem;
import com.swiftpos.service.SaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class SaleController {

    @Autowired
    private SaleService saleService;

    @GetMapping
    public List<Sale> getAllSales() {
        return saleService.getAllSales();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getSaleById(@PathVariable Long id) {
        Sale sale = saleService.getSaleById(id);
        if (sale != null) {
            List<SaleItem> items = saleService.getSaleItemsBySaleId(id);
            Map<String, Object> response = new HashMap<>();
            response.put("sale", sale);
            response.put("items", items);
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createSale(@RequestBody SaleRequest request) {
        try {
            Sale sale = saleService.processSale(request);
            return ResponseEntity.ok(sale);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
