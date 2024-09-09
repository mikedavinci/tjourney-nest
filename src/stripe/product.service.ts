// product.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateStripeProductDto } from './dto/create-product.dto';
import { ResponseStripeProductDto } from './dto/response-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  async createProduct(createProductDto: CreateStripeProductDto): Promise<{
    statusCode: number;
    message: string;
    data?: ResponseStripeProductDto;
  }> {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);

      return {
        statusCode: 201,
        message: 'Product created successfully',
        data: {
          id: product.id,
          name: product.name,
          price: product.price,
          subscription: product.subscription,
          price_per_month: product.price_per_month,
          description: product.description,
          quantity: product.quantity,
          currency: product.currency,
          stripe_product_id: product.stripe_product_id,
          stripe_price_id: product.stripe_price_id,
          payment_method_types: product.payment_method_types,
          tax_code: product.tax_code,
        },
      };
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        statusCode: 500,
        message: 'Internal Server Error. Please try again later or contact',
      };
    }
  }

  async getProductsByIds(productIds: string[]): Promise<Product[]> {
    return this.productRepository.findBy({ stripe_product_id: In(productIds) });
  }

  async getProductDetails(
    selectedPlanInternalCodes: string[],
    selectedPackageInternalCode: string,
    twoSelectedPackageInternalCode: string,
    additionalServiceInternalCodes: string[]
  ) {
    const selectedPlans =
      selectedPlanInternalCodes && selectedPlanInternalCodes.length > 0
        ? await this.productRepository.find({
            where: { internal_code: In(selectedPlanInternalCodes) },
          })
        : [];

    const selectedPackage =
      selectedPackageInternalCode && selectedPackageInternalCode.length > 0
        ? await this.productRepository.findOne({
            where: { internal_code: selectedPackageInternalCode },
          })
        : null;

    const twoSelectedPackage =
      twoSelectedPackageInternalCode &&
      twoSelectedPackageInternalCode.length > 0
        ? await this.productRepository.findOne({
            where: { internal_code: twoSelectedPackageInternalCode },
          })
        : null;

    const additionalServices =
      additionalServiceInternalCodes &&
      additionalServiceInternalCodes.length > 0
        ? await this.productRepository.find({
            where: { internal_code: In(additionalServiceInternalCodes) },
          })
        : [];

    const result: any = {
      selectedPlans: selectedPlans.map((plan) => ({
        id: plan.id,
        internal_code: plan.internal_code,
        name: plan.name,
        stripeProductId: plan.stripe_product_id,
        stripePriceId: plan.stripe_price_id,
      })),
      additionalServices: additionalServices.map((service) => ({
        id: service.id,
        internal_code: service.internal_code,
        name: service.name,
        stripeProductId: service.stripe_product_id,
        stripePriceId: service.stripe_price_id,
      })),
    };

    if (selectedPackage) {
      result.selectedPackage = {
        id: selectedPackage.id,
        internal_code: selectedPackage.internal_code,
        name: selectedPackage.name,
        stripeProductId: selectedPackage.stripe_product_id,
        stripePriceId: selectedPackage.stripe_price_id,
      };
    }

    if (twoSelectedPackage) {
      result.twoSelectedPackage = {
        id: twoSelectedPackage.id,
        internal_code: twoSelectedPackage.internal_code,
        name: twoSelectedPackage.name,
        stripeProductId: twoSelectedPackage.stripe_product_id,
        stripePriceId: twoSelectedPackage.stripe_price_id,
      };
    }

    return result;
  }
}
