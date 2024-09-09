import {
  Controller,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  Get,
  Req,
  Query,
  Res,
  Headers,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ProductDto } from './dto/product.dto';
import { CreateStripeProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProductService } from './product.service';
import { ResponseStripeProductDto } from './dto/response-product.dto';
import { OrdersService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UserService } from 'src/users/users.service';
import { Request, Response } from 'express';
import getRawBody = require('raw-body');
import { RequestUser } from './request.interface';
import { RawBody } from 'middleware/raw-body.decorator';
import { User } from 'src/users/entities/user.entity';

import { ResponseOrderDto } from './dto/response-order.dto';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly productsService: ProductService
  ) {}

  // @UseGuards(JwtAuthGuard)
  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body()
    body: {
      lineItems: { price: string; quantity: number }[];
      successUrl: string;
      cancelUrl: string;
      clientReferenceId?: string;
      customerEmail?: string;
      promotionCode?: string;
    }
  ) {
    try {
      const {
        lineItems,
        successUrl,
        cancelUrl,
        clientReferenceId,
        customerEmail,
        promotionCode,
      } = body;

      const session = await this.stripeService.createCheckoutSession({
        customerEmail,
        lineItems,
        mode: 'subscription',
        successUrl,
        cancelUrl,
        clientReferenceId,
        paymentMethodTypes: ['card'],
        promotionCode,
      });

      return {
        statusCode: 201,
        message: 'Checkout session created successfully',
        data: {
          session: session,
        },
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to create checkout session',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('webhook')
  async handleWebhook(
    @RawBody() rawBody: string | Buffer,
    @Headers('stripe-signature') signature: string,
    @Res() res: Response
  ) {
    try {
      await this.stripeService.handleWebhook(rawBody, signature);
      // console.log('Stripe webhook handled successfully');
      res.sendStatus(200);
    } catch (error) {
      // console.error('Error handling Stripe webhook:', error);
      // console.error('Signature:', signature);
      res.sendStatus(500);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body()
    body: {
      cartItems: { productId: string; quantity: number }[];
      description: string;
      receipt_email: string;
      billingDetails: {
        name: string;
        email: string;
        address: {
          line1: string;
          country: string;
          postal_code: string;
        };
        phone: string;
      };
    }
  ) {
    try {
      const { cartItems, description, receipt_email, billingDetails } = body;

      // Validate cart items
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Invalid cart items',
          },
          HttpStatus.BAD_REQUEST
        );
      }

      // Log cart items
      // console.log('Cart items:', cartItems);

      // Validate quantities
      cartItems.forEach((item) => {
        if (!item.quantity || item.quantity <= 0) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: 'Invalid quantity for product: ' + item.productId,
            },
            HttpStatus.BAD_REQUEST
          );
        }
      });

      // Create payment intent
      const paymentIntent = await this.stripeService.createPaymentIntent(
        cartItems,
        description,
        receipt_email,
        billingDetails
      );

      // Send the email invoice
      // await this.stripeService.sendEmailInvoice(paymentIntent.id, billingDetails);

      return {
        statusCode: 201,
        message: 'Payment intent created successfully',
        data: {
          clientSecret: paymentIntent.client_secret,
        },
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to create payment intent',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('products')
  @UseGuards(JwtAuthGuard)
  async getProductDetails(
    @Body('selectedPlanInternalCodes') selectedPlanInternalCodes: string[],
    @Body('selectedPackageInternalCode') selectedPackageInternalCode: string,
    @Body('twoSelectedPackageInternalCode')
    twoSelectedPackageInternalCode: string,
    @Body('additionalServiceInternalCodes')
    additionalServiceInternalCodes: string[]
  ) {
    try {
      const productDetails = await this.productsService.getProductDetails(
        selectedPlanInternalCodes,
        selectedPackageInternalCode,
        twoSelectedPackageInternalCode,
        additionalServiceInternalCodes
      );
      return {
        statusCode: 201,
        message: 'Product details retrieved successfully',
        data: productDetails,
      };
    } catch {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Error retrieving product details',
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('create-product')
  async create(@Body() createProductDto: CreateStripeProductDto): Promise<{
    statusCode: number;
    message: string;
    data?: ResponseStripeProductDto;
  }> {
    return this.productsService.createProduct(createProductDto);
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('save-order-details')
  // async saveOrderDetails(
  //   @CurrentUser() user: User,
  //   @Body() createOrderDto: CreateOrderDto
  // ): Promise<{
  //   statusCode: number;
  //   message: string;
  //   data?: ResponseOrderDto;
  // }> {
  //   try {
  //     return await this.stripeService.saveOrderDetails(createOrderDto, user);
  //   } catch (error) {
  //     console.error('Error saving order details:', error);
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.BAD_REQUEST,
  //         error: 'Failed to save order details',
  //       },
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }
  // }
}
