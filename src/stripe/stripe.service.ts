import { UserService } from 'src/users/users.service';
import { Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { ProductService } from './product.service';
import { MailService } from 'src/mail/mail.service';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from 'src/users/entities/user.entity';
import { ResponseOrderDto } from './dto/response-order.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private mailService: MailService;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
    // this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    //   apiVersion: '2024-04-10',
    // });

    this.stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY, {
      apiVersion: '2024-04-10',
    });
  }

  async findOrCreateCustomerByEmail(email: string): Promise<Stripe.Customer> {
    const customers = await this.stripe.customers.list({ email, limit: 1 });

    if (customers.data.length > 0) {
      return await this.stripe.customers.update(customers.data[0].id, {
        email,
      });
    }

    return await this.stripe.customers.create({ email });
  }

  async createCheckoutSession(params: {
    customerEmail?: string;
    lineItems: { price: string; quantity: number }[];
    mode: string;
    successUrl: string;
    cancelUrl: string;
    clientReferenceId?: string;
    paymentMethodTypes?: string[];
    promotionCode?: string;
  }) {
    const {
      customerEmail,
      lineItems,
      mode,
      successUrl,
      cancelUrl,
      clientReferenceId,
      paymentMethodTypes,
      promotionCode,
    } = params;

    let customerId: string | undefined;

    if (customerEmail) {
      const customer = await this.findOrCreateCustomerByEmail(customerEmail);
      customerId = customer.id;
    }

    const sessionCreateParams: Stripe.Checkout.SessionCreateParams = {
      line_items: lineItems,
      mode: mode as Stripe.Checkout.SessionCreateParams.Mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: clientReferenceId,
      payment_method_types: paymentMethodTypes.map(
        (type) => type as Stripe.Checkout.SessionCreateParams.PaymentMethodType
      ),
      discounts: promotionCode ? [{ coupon: promotionCode }] : undefined,
    };

    // Conditionally include customer or customer_email
    if (customerId) {
      sessionCreateParams.customer = customerId;
    } else if (customerEmail) {
      sessionCreateParams.customer_email = customerEmail;
    }

    const session =
      await this.stripe.checkout.sessions.create(sessionCreateParams);

    // console.log('Session created:', session);
    return session;
  }

  async handleWebhook(rawBody: string | Buffer, signature: string) {
    try {
      const event = await this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      const session = event.data.object as Stripe.Checkout.Session;

      switch (event.type) {
        case 'checkout.session.async_payment_failed':
          // Handle async payment failed event
          const checkoutSessionAsyncPaymentFailed = event.data.object;

          console.log(
            'Async payment failed for session:',
            checkoutSessionAsyncPaymentFailed
          );
          // Perform any necessary actions, such as updating order status or sending notifications
          break;

        case 'checkout.session.async_payment_succeeded':
          // Handle async payment succeeded event
          const checkoutSessionAsyncPaymentSucceeded = event.data.object;

          console.log(
            'Async payment succeeded for session:',
            checkoutSessionAsyncPaymentSucceeded
          );
          // Perform any necessary actions, such as updating order status or fulfilling the order
          break;

        case 'checkout.session.completed':
          // Handle checkout session completed event
          const checkoutSessionCompleted = event.data.object;

          console.log('Checkout session completed:', checkoutSessionCompleted);
          // Extract relevant data from the session and save the order details to the database

          // console.log('existingUser', existingUser);
          await this.saveOrderDetails(session);
          break;

        case 'checkout.session.expired':
          // Handle checkout session expired event
          const checkoutSessionExpired = event.data.object;

          console.log('Checkout session expired:', checkoutSessionExpired);
          // Perform any necessary actions, such as cleaning up incomplete orders or sending notifications
          break;

        default:
          console.log('Unhandled event type:', event.type);
      }
    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
      throw error;
    }
  }

  async saveOrderDetails(session: Stripe.Checkout.Session): Promise<void> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: session.customer_details.email },
      });

      if (!existingUser) {
        console.error('User not found:', session.customer_details.email);
        throw new Error('User not found');
      }

      existingUser.isProMember = true;
      await this.userRepository.save(existingUser);

      const email = session.customer_details.email;
      const discount = session.total_details.amount_discount;

      const order = this.orderRepository.create({
        session_id: session.id,
        client_reference_id: session.client_reference_id,
        customer_id: session.customer as string,
        customer_email: email,
        invoice: session.invoice as string,
        payment_status: session.payment_status,
        amount_subtotal: session.amount_subtotal,
        amount_total: session.amount_total,
        currency: session.currency,
        subscription: session.subscription as string,
        total_details: session.total_details,
        amount_discount: discount || 0,
        userId: existingUser.id,
      });

      await this.orderRepository.save(order);

      console.log('Order details saved successfully');
    } catch (error) {
      console.error('Error saving order details:', error);
      throw new Error('Failed to save order details');
    }
  }

  async createPaymentIntent(
    cartItems: { productId: string; quantity: number }[],
    description: string,
    receipt_email: string,
    billingDetails: {
      name: string;
      email: string;
      address: {
        line1: string;
        country: string;
        postal_code: string;
      };
      phone: string;
    }
  ) {
    try {
      const productIds = cartItems.map((item) => item.productId);

      // Fetch products individually using Promise.all()
      const products = await Promise.all(
        productIds.map((productId) =>
          this.stripe.products.retrieve(productId, {
            expand: ['default_price'],
          })
        )
      );

      // Log fetched products
      // console.log('Fetched products:', products.data);

      // Create line items
      const lineItems = products.map((product) => {
        const price = product.default_price as Stripe.Price;
        const quantity =
          cartItems.find((item) => item.productId === product.id)?.quantity ||
          0;

        // Validate price and quantity
        const unitAmount = price.unit_amount || 0;
        if (isNaN(unitAmount) || isNaN(quantity)) {
          throw new Error(
            `Invalid unit amount or quantity for product ${product.id}`
          );
        }

        // Log each line item
        console.log(
          `Product ID: ${product.id}, Unit Amount: ${unitAmount}, Quantity: ${quantity}`
        );

        return {
          price: unitAmount,
          quantity,
        };
      });

      // ininital amount
      const iniAmount = lineItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      // Calculate total amount
      const amount = iniAmount;

      // Log the calculated amount
      console.log('Total amount:', amount);

      // Validate amount
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid total amount');
      }

      // Create simplified metadata
      const metadata = {
        // generate a random order id number prefixed with PW
        order_id: `PW${Math.floor(Math.random() * 1000000)}`,
        cartItemIds: JSON.stringify(cartItems.map((item) => item.productId)),
        cartItemQuantities: JSON.stringify(
          cartItems.map((item) => item.quantity)
        ),
      };

      let customer: any;

      // Check if a customer with the same email already exists
      const existingCustomer = await this.stripe.customers.list({
        email: billingDetails.email,
        limit: 1,
      });

      if (existingCustomer.data.length > 0) {
        // Use the existing customer
        customer = existingCustomer.data[0];
      } else {
        // Create a new customer
        customer = await this.stripe.customers.create({
          name: billingDetails.name,
          email: billingDetails.email,
          phone: billingDetails.phone,
          address: {
            line1: billingDetails.address.line1,
            country: billingDetails.address.country,
            postal_code: billingDetails.address.postal_code,
          },
        });
      }

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        description,
        receipt_email,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata,
        customer: customer.id,
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  async sendEmailInvoice(
    paymentIntentId: string,
    billingDetails: { email: string }
  ) {
    try {
      // Retrieve the payment intent
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);

      // Create an invoice for the payment
      const invoice = await this.stripe.invoices.create({
        customer: paymentIntent.customer as string,
        auto_advance: true,
        collection_method: 'charge_automatically',
        description: paymentIntent.description,
        metadata: paymentIntent.metadata,
      });

      // Send the invoice to the customer's email
      // await this.mailService.sendInvoice(billingDetails.email, invoice);
    } catch (error) {
      console.error('Error sending email invoice:', error);
      throw new Error('Failed to send email invoice');
    }
  }
}

// checkout endpoint
// async checkout(productDto: ProductDto, customerId: string) {
//   const lineItems = await Promise.all(
//     productDto.products.map(async ({ id, quantity }) => {
//       const product = await this.productRepository.findOne({
//         where: { id },
//       });

//       if (!product) {
//         throw new Error(`Product with ID ${id} not found`);
//       }

//       // Creating or retrieving a Stripe Product and Price
//       let stripeProduct = await this.stripe.products.create({
//         name: product.name,
//         description: product.description,
//       });

//       let stripePrice = await this.stripe.prices.create({
//         unit_amount: product.price * 100,
//         currency: product.currency,
//         product: stripeProduct.id,
//       });

//       return {
//         price: stripePrice.id,
//         quantity: quantity,
//       };
//     })
//   );

//   // Create a Checkout Session
//   const session = await this.stripe.checkout.sessions.create({
//     payment_method_types: ['card'],
//     line_items: lineItems,
//     customer: customerId,
//     mode: 'payment',
//     success_url: 'https://your-website.com/success',
//     cancel_url: 'https://your-website.com/cancel',
//   });

//   return session;
// }

// async charge(id: number, token: string) {
//   const product = await this.productRepository.findOne({
//     where: { id },
//   });

//   if (!product) {
//     throw new Error('Product not found');
//   }

//   const charge = await this.stripe.charges.create({
//     amount: product.price * 100, // converting to cents
//     currency: product.currency,
//     source: token, // obtained with Stripe.js
//     description: product.description || `Charge for product ID ${id}`,
//   });

//   return charge;
// }

// async createSubscription(id: number, customerId: string) {
//   const product = await this.productRepository.findOne({
//     where: { id },
//   });

//   if (!product || !product.subscription) {
//     throw new Error('Subscription product not found');
//   }

//   let stripeProduct = await this.stripe.products.create({
//     name: product.name,
//     description: product.description,
//   });

//   let stripePrice = await this.stripe.prices.create({
//     unit_amount: product.pricePerMonth * 100, // converting to cents
//     currency: product.currency,
//     recurring: { interval: 'month' },
//     product: stripeProduct.id,
//   });

//   const subscription = await this.stripe.subscriptions.create({
//     customer: customerId,
//     items: [{ price: stripePrice.id }],
//   });

//   return subscription;
// }

// async createStripeProductAndPrice(product: Product) {
//   const stripeProduct = await this.stripe.products.create({
//     name: product.name,
//     description: product.description,
//   });

//   const stripePrice = await this.stripe.prices.create({
//     unit_amount: product.price * 100, // converting to cents
//     currency: product.currency,
//     product: stripeProduct.id,
//   });

//   // Save Stripe IDs back to your database
//   product.stripeProductId = stripeProduct.id;
//   product.stripePriceId = stripePrice.id;
//   await this.productRepository.save(product);

//   return { stripeProduct, stripePrice };
// }
