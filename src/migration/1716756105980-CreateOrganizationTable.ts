import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOrganizationTable1716756105980
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'organization',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'organizationName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'organizationType',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'organizationSize',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'targetAudience',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'challenges',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'previousStrategy',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'objectives',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'mainCompetitors',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'typicalCustomerJourney',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'brandPersonality',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'brandValues',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'userExperience',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'facebook_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'twitter_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'instagram_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'linkedin_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'youtube_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'whatsapp',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'website_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'logo',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'coverImage',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'about',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'video_development',
            type: 'jsonb',
          },
          {
            name: 'landing_page_development',
            type: 'jsonb',
          },
          {
            name: 'content_creation',
            type: 'jsonb',
          },
          {
            name: 'live_chat_implementation',
            type: 'jsonb',
          },
          {
            name: 'knowledge_base_development',
            type: 'jsonb',
          },
          {
            name: 'email_marketing_campaign',
            type: 'jsonb',
          },
          {
            name: 'email_marketing_management',
            type: 'jsonb',
          },
          {
            name: 'social_media_campaign_management',
            type: 'jsonb',
          },
          {
            name: 'seo',
            type: 'jsonb',
          },
          {
            name: 'ai_training',
            type: 'jsonb',
          },
          {
            name: 'crm_storage',
            type: 'jsonb',
          },
          {
            name: 'payment_gateway_implementation',
            type: 'jsonb',
          },
          {
            name: 'site_analytics',
            type: 'jsonb',
          },
          {
            name: 'custom_llm',
            type: 'jsonb',
          },
          {
            name: 'sms_campaign',
            type: 'jsonb',
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
    await queryRunner.dropTable('organization');
  }
}
