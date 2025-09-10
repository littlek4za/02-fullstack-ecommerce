package com.myapp.ecommerce.service;

import com.myapp.ecommerce.dto.PaymentInfo;
import com.myapp.ecommerce.dto.Purchase;
import com.myapp.ecommerce.dto.PurchaseResponse;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

public interface CheckoutService {

    PurchaseResponse placeOrder(Purchase purchase);

    PaymentIntent createPaymentIntent (PaymentInfo paymentInfo) throws StripeException;
}
