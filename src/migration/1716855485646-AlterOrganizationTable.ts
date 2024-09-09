import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterOrganizationTable1716855485646 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "organization"
          ALTER COLUMN "video_development" SET DEFAULT '[]',
          ALTER COLUMN "video_development" DROP NOT NULL,
          ALTER COLUMN "landing_page_development" SET DEFAULT '[]',
          ALTER COLUMN "landing_page_development" DROP NOT NULL,
          ALTER COLUMN "content_creation" SET DEFAULT '[]',
          ALTER COLUMN "content_creation" DROP NOT NULL,
          ALTER COLUMN "live_chat_implementation" SET DEFAULT '[]',
          ALTER COLUMN "live_chat_implementation" DROP NOT NULL,
          ALTER COLUMN "knowledge_base_development" SET DEFAULT '[]',
          ALTER COLUMN "knowledge_base_development" DROP NOT NULL,
          ALTER COLUMN "email_marketing_campaign" SET DEFAULT '[]',
          ALTER COLUMN "email_marketing_campaign" DROP NOT NULL,
          ALTER COLUMN "email_marketing_management" SET DEFAULT '[]',
          ALTER COLUMN "email_marketing_management" DROP NOT NULL,
          ALTER COLUMN "social_media_campaign_management" SET DEFAULT '[]',
          ALTER COLUMN "social_media_campaign_management" DROP NOT NULL,
          ALTER COLUMN "seo" SET DEFAULT '[]',
          ALTER COLUMN "seo" DROP NOT NULL,
          ALTER COLUMN "ai_training" SET DEFAULT '[]',
          ALTER COLUMN "ai_training" DROP NOT NULL,
          ALTER COLUMN "crm_storage" SET DEFAULT '[]',
          ALTER COLUMN "crm_storage" DROP NOT NULL,
          ALTER COLUMN "payment_gateway_implementation" SET DEFAULT '[]',
          ALTER COLUMN "payment_gateway_implementation" DROP NOT NULL,
          ALTER COLUMN "site_analytics" SET DEFAULT '[]',
          ALTER COLUMN "site_analytics" DROP NOT NULL,
          ALTER COLUMN "custom_llm" SET DEFAULT '[]',
          ALTER COLUMN "custom_llm" DROP NOT NULL,
          ALTER COLUMN "sms_campaign" SET DEFAULT '[]',
          ALTER COLUMN "sms_campaign" DROP NOT NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "organization"
          ALTER COLUMN "video_development" DROP DEFAULT,
          ALTER COLUMN "video_development" SET NOT NULL,
          ALTER COLUMN "landing_page_development" DROP DEFAULT,
          ALTER COLUMN "landing_page_development" SET NOT NULL,
          ALTER COLUMN "content_creation" DROP DEFAULT,
          ALTER COLUMN "content_creation" SET NOT NULL,
          ALTER COLUMN "live_chat_implementation" DROP DEFAULT,
          ALTER COLUMN "live_chat_implementation" SET NOT NULL,
          ALTER COLUMN "knowledge_base_development" DROP DEFAULT,
          ALTER COLUMN "knowledge_base_development" SET NOT NULL,
          ALTER COLUMN "email_marketing_campaign" DROP DEFAULT,
          ALTER COLUMN "email_marketing_campaign" SET NOT NULL,
          ALTER COLUMN "email_marketing_management" DROP DEFAULT,
          ALTER COLUMN "email_marketing_management" SET NOT NULL,
          ALTER COLUMN "social_media_campaign_management" DROP DEFAULT,
          ALTER COLUMN "social_media_campaign_management" SET NOT NULL,
          ALTER COLUMN "seo" DROP DEFAULT,
          ALTER COLUMN "seo" SET NOT NULL,
          ALTER COLUMN "ai_training" DROP DEFAULT,
          ALTER COLUMN "ai_training" SET NOT NULL,
          ALTER COLUMN "crm_storage" DROP DEFAULT,
          ALTER COLUMN "crm_storage" SET NOT NULL,
          ALTER COLUMN "payment_gateway_implementation" DROP DEFAULT,
          ALTER COLUMN "payment_gateway_implementation" SET NOT NULL,
          ALTER COLUMN "site_analytics" DROP DEFAULT,
          ALTER COLUMN "site_analytics" SET NOT NULL,
          ALTER COLUMN "custom_llm" DROP DEFAULT,
          ALTER COLUMN "custom_llm" SET NOT NULL,
          ALTER COLUMN "sms_campaign" DROP DEFAULT,
          ALTER COLUMN "sms_campaign" SET NOT NULL;
        `);
  }
}
