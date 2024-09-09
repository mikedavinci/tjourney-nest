import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProductTable1716756012846 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'internal_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'subscription',
            type: 'boolean',
            isNullable: true,
            default: false,
          },
          {
            name: 'price_per_month',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'quantity',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'currency',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'stripe_product_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'stripe_price_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'payment_method_types',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'tax_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdDate',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedDate',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('product');
  }
}
