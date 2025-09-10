package com.myapp.ecommerce.dto;

import lombok.Data;

import java.util.Set;

import com.myapp.ecommerce.entity.Address;
import com.myapp.ecommerce.entity.Customer;
import com.myapp.ecommerce.entity.Order;
import com.myapp.ecommerce.entity.OrderItem;

@Data
public class Purchase {

    private Customer customer;

    private Address shippingAddress; //t

    private Address billingAddress; //t

    private Order order;

    private Set<OrderItem> orderItemSet; //t
}
