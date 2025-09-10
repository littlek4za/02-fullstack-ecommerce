import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { CustomCOFormValidator } from 'src/app/validators/custom-coform-validator';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];
  storage: Storage = sessionStorage;

  // initialize Stripe API
  stripe = Stripe(environment.stripePulishableKey);

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = "";

  purchaseBtnDisabled: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private shopFormService: ShopFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router) { }

  ngOnInit(): void {

    //setup Stripe payment form
    this.setupStripePaymentForm();

    //read user email from sessionStorage
    const theEmail = JSON.parse(this.storage.getItem('userEmail') || 'null');

    //get data for checkout form
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          CustomCOFormValidator.notOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required,
        Validators.minLength(2),
        CustomCOFormValidator.notOnlyWhiteSpace]),
        email: new FormControl(theEmail, [Validators.required,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        CustomCOFormValidator.notOnlyWhiteSpace])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          CustomCOFormValidator.notOnlyWhiteSpace]),
        city: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          CustomCOFormValidator.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required,]),
        country: new FormControl('', [Validators.required,]),
        zipCode: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          CustomCOFormValidator.notOnlyWhiteSpace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          CustomCOFormValidator.notOnlyWhiteSpace]),
        city: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          CustomCOFormValidator.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required,]),
        country: new FormControl('', [Validators.required,]),
        zipCode: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          CustomCOFormValidator.notOnlyWhiteSpace])
      }),
      creditCard: this.formBuilder.group({
        // cardType: new FormControl('',
        //   [Validators.required]),
        // nameOnCard: new FormControl('',
        //   [Validators.required,
        //   Validators.minLength(2),
        //   CustomCOFormValidator.notOnlyWhiteSpace]),
        // cardNumber: new FormControl('',
        //   [Validators.required,
        //   Validators.pattern('^[0-9]{16}$')]),
        // securityCode: new FormControl('',
        //   [Validators.required,
        //   Validators.pattern('^[0-9]{3}$')]),
        // expirationMonth: new FormControl('',
        //   [Validators.required]),
        // expirationYear: new FormControl('',
        //   [Validators.required])
      })
    });

    /*
    // get data credit card's months and years
    const startMonth: number = new Date().getMonth() + 1;
    console.log(`Start Month: ${startMonth}`);
    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
        console.log("Retrieved credit card months:" + JSON.stringify(data));
      }
    );

    const startYear: number = new Date().getFullYear();
    console.log(`Start Year: ${startYear}`);
    this.shopFormService.getCreditCardYears(startYear).subscribe(
      data => {
        this.creditCardYears = data;
        console.log("Retrieved credit card years:" + JSON.stringify(data));
      }
    ); */

    //get data for shipping address's countries 
    this.shopFormService.getCountries().subscribe(
      data => {
        this.countries = data;
        console.log("Retrieved countries: " + JSON.stringify(data, null, 2));
      }
    );

    this.reviewCartDetails();

  }

  setupStripePaymentForm() {
    // get a handle to stripe elements
    var elements = this.stripe.elements();

    // create a card element ... and hide the zip-code field
    this.cardElement = elements.create('card', { hidePostalCode: true });

    // Add an instance of card UI component into the card-element div
    this.cardElement.mount('#card-element');

    // Add event binding for the 'change' event on the card element
    this.cardElement.on('change', (event: any) => {

      // get a handle to card-errors element
      this.displayError = document.getElementById('card-errors');

      if (event.complete) {
        this.displayError.textContent = "";
      } else if (event.error) {
        //show validation error to customer
        this.displayError.textContent = event.error.message;
      }
    })

  }

  //this is a way for formGroup to access the data 
  //customer
  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  //shippingAddress
  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }

  //billingAddress
  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }
  get creditCardExpirationMonth() { return this.checkoutFormGroup.get('creditCard.expirationMonth'); }
  get creditCardExpirationYear() { return this.checkoutFormGroup.get('creditCard.expirationYear'); }

  copyShippingAddressToBillingAddress(event: any) {

    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      //bug fix for states
      this.billingAddressStates = this.shippingAddressStates;
    }
    else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      //bug fix for states
      this.billingAddressStates = [];
    }
  }

  onSubmit() {
    console.log('Handling submit button');

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    console.log(JSON.stringify(this.checkoutFormGroup.value, null, 2));

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice
    order.totalQuantity = this.totalQuantity

    // get cart items
    const cartItemSet: CartItem[] = this.cartService.cartItems;

    // create orderItems from cartItems
    let orderItemSet: OrderItem[] = cartItemSet.map(
      cartItem => new OrderItem(cartItem)
    );

    // set up purchase
    let purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchase - shippingAddress
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    //method1 for state
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    purchase.shippingAddress.state = shippingState.name;
    //method2 for country
    purchase.shippingAddress.country = this.checkoutFormGroup.get('shippingAddress.country')!.value.name;


    // populate purchase - billingAddress
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = this.checkoutFormGroup.get('billingAddress.country')!.value.name;

    // populate purchase - order and orderItemSet
    purchase.order = order;
    purchase.orderItemSet = orderItemSet;

    // log for purchase JSON
    console.log(JSON.stringify(purchase, null, 2));

    // compute payment Info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";
    this.paymentInfo.receiptEmail = purchase.customer.email;

    console.log(`Payment info amount: ${this.paymentInfo.amount}`);
    // if valid form then
    // - create payment intent
    // - confirm card payment
    // - place order

    if (!this.checkoutFormGroup.invalid && this.displayError.textContent === "") {

      this.purchaseBtnDisabled = true;
      // send payment info to backend, backend create paymentintent and responce with the paymentintent object
      // angular use confirmCardPayment, it include the responce client_secret and card info and send to stripe server to verify
      // angular -> backend -> stripe -> backend -> angular(with secret and card info) -> stripe(confirmation) -> angular
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentReponse) => {
          this.stripe.confirmCardPayment(paymentIntentReponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,
                billing_details: {
                  email: purchase.customer.email,
                  name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                  address: {
                    line1: purchase.billingAddress.street,
                    city: purchase.billingAddress.city,
                    state: purchase.billingAddress.state,
                    postal_code: purchase.billingAddress.zipCode,
                    country: this.billingAddressCountry?.value.code
                  }
                }
              }
            }, { handleAction: false })
            .then((result: any) => {
              if (result.error) {
                //inform the customer there was an error
                alert(`There was an error: ${result.error.message}`);
                this.purchaseBtnDisabled = false;
              } else {
                //call REST API via the CheckoutService
                this.checkoutService.placeOrder(purchase).subscribe({
                  next: (response: any) => {
                    alert(`Your order have been received. \nOrder tracking number ${response.orderTrackingNumber}`)

                    //reset cart
                    this.resetCart();
                    this.purchaseBtnDisabled = false;
                  },
                  error: (err: any) => {
                    alert(`There was an error: ${err.message}`);
                    this.purchaseBtnDisabled = false;
                  }
                })
              }
            })
        }
      );
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
  }

  resetCart() {
    //reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItem();

    //reset the form
    this.checkoutFormGroup.reset();

    //navigate back to the products page
    this.router.navigateByUrl("/product");
  }

  handleMonthsandYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup!.value.expirationYear);
    console.log('Selected Year: ' + selectedYear);

    let startMonth: number = 1;

    if (currentYear == selectedYear) {
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("updated months:" + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    )
  }

  getStatesForForm(formGroupName: string) {
    // pass selected country to get data for shipping address's state
    const countryCode: string = this.checkoutFormGroup.get(formGroupName)!.value.country.code;
    //country is an object pass by ngValue, if there is no ngValue, .value.country will pass the value of the selected result which is country name
    //tldr ngValue make the selected as object instead of the property of the object that use to display 
    console.log(`countryCode for ${formGroupName}: ${countryCode}`);

    this.shopFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === "shippingAddress") {
          this.shippingAddressStates = data;
        }

        if (formGroupName === "billingAddress") {
          this.billingAddressStates = data;
        }

        this.checkoutFormGroup.get(formGroupName)?.get('state')?.setValue(data[0]);
      }
    )
  }

  reviewCartDetails() {
    this.cartService.totalPrice.subscribe(
      data => {
        this.totalPrice = data;
      }
    );
    this.cartService.totalQuantity.subscribe(
      data => {
        this.totalQuantity = data;
      }
    );
  }
}