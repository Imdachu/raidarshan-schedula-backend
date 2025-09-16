import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOnboardingStepToUser1757991309762 implements MigrationInterface {
    name = 'AddOnboardingStepToUser1757991309762'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "onboarding_step" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "onboarding_step"`);
    }

}
