package com.swiftpos.repository;

import com.swiftpos.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {
    List<SaleItem> findBySaleId(Long saleId);
}
