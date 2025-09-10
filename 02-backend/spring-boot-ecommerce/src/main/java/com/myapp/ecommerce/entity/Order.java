package com.myapp.ecommerce.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "order_tracking_number")
    private String orderTrackingNumber; //d

    @Column(name = "total_price")
    private BigDecimal totalPrice; //d

    @Column(name = "total_quantity")
    private BigDecimal totalQuantity; //d

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "billing_address_id",referencedColumnName = "id")
    private Address billingAddress; //d

    @ManyToOne
    @JoinColumn(name="customer_id")
    private Customer customer;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "shipping_address_id",referencedColumnName = "id")
    private Address shippingAddress; //d

    @Column(name ="status")
    private String status;

    @Column(name="date_created")
    @CreationTimestamp
    private Date dateCreated;

    @Column(name="last_updated")
    @UpdateTimestamp
    private Date lastUpdated;

    @OneToMany (cascade = CascadeType.ALL, mappedBy = "order")
    private Set<OrderItem> orderItemSet = new HashSet<>(); //d

    public void add(OrderItem orderItem){
        if(orderItem != null){
            if(orderItemSet == null){
                orderItemSet = new HashSet<>();
            }
            orderItemSet.add(orderItem);
            orderItem.setOrder(this);
        }
    }
}
