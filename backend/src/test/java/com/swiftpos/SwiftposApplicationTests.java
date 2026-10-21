package com.swiftpos;

import com.swiftpos.entity.Product;
import com.swiftpos.entity.User;
import com.swiftpos.repository.ProductRepository;
import com.swiftpos.repository.SaleRepository;
import com.swiftpos.repository.UserRepository;
import com.swiftpos.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class SwiftposApplicationTests {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Test
    void contextLoads() {
        assertNotNull(productService);
        assertNotNull(productRepository);
        assertNotNull(userRepository);
        assertNotNull(saleRepository);
    }

    @Test
    void testProductListing() {
        List<Product> products = productService.getAllProducts();
        assertNotNull(products);
    }

    @Test
    void testUserLookup() {
        var user = userRepository.findByEmail("admin@swiftpos.com");
        assertTrue(user.isPresent());
        assertEquals("ADMIN", user.get().getRole());
    }
}
