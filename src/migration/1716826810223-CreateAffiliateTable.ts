import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAffiliateTable1716826810223 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'affiliate_partner',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'phoneNumber',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'affiliateCode',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'companyName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'coverLetter',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'hearAboutUs',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'website',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'commissionRate',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'paymentThreshold',
            type: 'decimal',
            isNullable: true,
          },
          {
            name: 'paymentMethod',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'promotionalMaterials',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'isApproved',
            type: 'boolean',
            default: false,
          },
          {
            name: 'approvedBy',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'approvedDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdDate',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updatedDate',
            type: 'timestamptz',
            isNullable: true,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('affiliate_partner');
  }
}
