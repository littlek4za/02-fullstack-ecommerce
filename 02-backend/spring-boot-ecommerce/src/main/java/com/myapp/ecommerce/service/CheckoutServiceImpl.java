package com.myapp.ecommerce.service;

import com.myapp.ecommerce.dao.CustomerRepository;
import com.myapp.ecommerce.dto.PaymentInfo;
import com.myapp.ecommerce.dto.Purchase;
import com.myapp.ecommerce.dto.PurchaseResponse;
import com.myapp.ecommerce.entity.Address;
import com.myapp.ecommerce.entity.Customer;
import com.myapp.ecommerce.entity.Order;
import com.myapp.ecommerce.entity.OrderItem;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CheckoutServiceImpl implements CheckoutService {

    private CustomerRepository customerRepository;

    @Autowired
    public CheckoutServiceImpl(CustomerRepository customerRepository,
                               @Value("${stripe.key.secret}") String secretKey) {
        this.customerRepository = customerRepository;
        Stripe.apiKey = secretKey;
    }

    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {
        // retrieve the order info from dto
        Order order = purchase.getOrder();

        // generate tracking number
        String orderTrackingNumber = generateOrderTrackingNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);

        // populate order with orderItems
        Set<OrderItem> orderItemSet = purchase.getOrderItemSet();
        orderItemSet.forEach(orderItem -> order.add(orderItem));

        // populate order with billingAddress and shippingAddress
        Address billingAddress = purchase.getBillingAddress();
        order.setBillingAddress(billingAddress);
        Address shippingAddress = purchase.getShippingAddress();
        order.setShippingAddress(shippingAddress);

        // populate customer with order
        Customer customer = purchase.getCustomer();
        Customer customerFromDB = customerRepository.findByEmail(customer.getEmail());
        if (customerFromDB != null){
            customer = customerFromDB;
        }

        customer.add(order); //this also do order.setCustomer(this.customer)

        // save to the database
        customerRepository.save(customer);


        //return a response
        return new PurchaseResponse(orderTrackingNumber);
    }

    @Override
    public PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException {

        //create a list of payment method types
        List<String> paymentMethodTypes = new ArrayList<>();
        paymentMethodTypes.add("card");

        // create hashmap for parameters
        // follow the keys
        Map<String,Object> params = new HashMap<>();
        params.put("amount",paymentInfo.getAmount());
        params.put("currency", paymentInfo.getCurrency());
        params.put("payment_method_types", paymentMethodTypes);
        params.put("description", "Luv2ShopPurchase");
        params.put("receipt_email", paymentInfo.getReceiptEmail());

        //create payment intent with hashmap
        return PaymentIntent.create(params);
    }

    private String generateOrderTrackingNumber() {
        // generate a random UUID
        return UUID.randomUUID().toString();
    }
}
