package com.swiftpos.dto;

import lombok.Data;
import java.util.List;

@Data
public class SaleRequest {
    private Long cashierId;
    private String paymentMethod;
    private List<SaleItemRequest> items;
}
