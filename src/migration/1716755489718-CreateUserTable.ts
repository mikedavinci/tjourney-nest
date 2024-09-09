import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserTable1716755489718 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'displayName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'phoneNumber',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'avatar',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'isOnboarded',
            type: 'boolean',
            default: false,
          },
          {
            name: 'sp_client_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'sp_client_secret',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'emailVerified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'resetToken',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'resetTokenExpiry',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'isAdmin',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isAffiliate',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isProMember',
            type: 'boolean',
            default: false,
          },
          {
            name: 'tempPlanSelected',
            type: 'boolean',
            default: false,
          },
          {
            name: 'flowReady',
            type: 'boolean',
            default: false,
          },
          {
            name: 'selectedPlan',
            type: 'enum',
            enum: [
              'FREE',
              'EARLY_ADOPTER',
              'ENTERPRISE',
              'SAAS',
              'PROFESSIONAL',
            ],
            isNullable: true,
          },
          {
            name: 'orgAssociated',
            type: 'boolean',
            default: false,
          },
          {
            name: 'agreedTOSPrivacy',
            type: 'boolean',
            default: false,
          },
          {
            name: 'objectives',
            type: 'text',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'organizationId',
            type: 'int',
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
    await queryRunner.dropTable('user');
  }
}
