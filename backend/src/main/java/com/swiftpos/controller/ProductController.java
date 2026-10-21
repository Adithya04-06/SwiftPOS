package com.swiftpos.controller;

import com.swiftpos.entity.Product;
import com.swiftpos.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return product != null ? ResponseEntity.ok(product) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Product name is required");
        }
        if (product.getSku() == null || product.getSku().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Product SKU is required");
        }
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().body("Price must be a non-negative number");
        }
        if (product.getStock() == null || product.getStock() < 0) {
            return ResponseEntity.badRequest().body("Stock must be non-negative");
        }
        if (product.getMinimumStock() == null || product.getMinimumStock() < 0) {
            product.setMinimumStock(0);
        }
        try {
            Product created = productService.createProduct(product);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create product: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        if (productDetails.getName() == null || productDetails.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Product name is required");
        }
        if (productDetails.getSku() == null || productDetails.getSku().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Product SKU is required");
        }
        if (productDetails.getPrice() == null || productDetails.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            return ResponseEntity.badRequest().body("Price must be non-negative");
        }
        if (productDetails.getStock() == null || productDetails.getStock() < 0) {
            return ResponseEntity.badRequest().body("Stock must be non-negative");
        }
        if (productDetails.getMinimumStock() == null || productDetails.getMinimumStock() < 0) {
            productDetails.setMinimumStock(0);
        }
        try {
            Product updatedProduct = productService.updateProduct(id, productDetails);
            return updatedProduct != null ? ResponseEntity.ok(updatedProduct) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update product: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        Product existing = productService.getProductById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Cannot delete product because it has associated transaction records.");
        }
    }
}
