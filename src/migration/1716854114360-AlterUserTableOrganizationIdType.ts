import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterUserTableOrganizationIdType1716854114360
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'user',
      'organizationId',
      new TableColumn({
        name: 'organizationId',
        type: 'uuid',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'user',
      'organizationId',
      new TableColumn({
        name: 'organizationId',
        type: 'int',
        isNullable: true,
      })
    );
  }
}
