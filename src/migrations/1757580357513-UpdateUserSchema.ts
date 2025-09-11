import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserSchema1757580357513 implements MigrationInterface {
    name = 'UpdateUserSchema1757580357513'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."users_provider_enum" AS ENUM('google')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "provider" "public"."users_provider_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'patient'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
        await queryRunner.query(`DROP TYPE "public"."users_provider_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
    }

}
