import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateHelpCenterTable1716757758942 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'helpcenter',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'fullName',
            type: 'varchar',
            isNullable: true,
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
    await queryRunner.dropTable('helpcenter');
  }
}
