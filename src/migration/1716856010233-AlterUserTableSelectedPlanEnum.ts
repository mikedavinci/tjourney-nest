import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserTableSelectedPlanEnum1716856010233
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "user"
          DROP COLUMN "selectedPlan",
          ADD COLUMN "selectedPlan" VARCHAR(255) CHECK ("selectedPlan" IN ('Ignite', 'Accelerate', 'Dominate', 'None'));
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "user"
          DROP COLUMN "selectedPlan",
          ADD COLUMN "selectedPlan" VARCHAR(255) CHECK ("selectedPlan" IN ('FREE', 'EARLY_ADOPTER', 'ENTERPRISE', 'SAAS', 'PROFESSIONAL'));
        `);
  }
}
