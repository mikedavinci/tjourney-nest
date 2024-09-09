import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOrderTable1716755806079 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'session_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'client_reference_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'customer_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'customer_email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'invoice',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'payment_status',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'amount_subtotal',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'amount_total',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'currency',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'subscription',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'total_details',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'amount_discount',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            name: 'FK_Order_User',
            columnNames: ['userId'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('order');
  }
}
