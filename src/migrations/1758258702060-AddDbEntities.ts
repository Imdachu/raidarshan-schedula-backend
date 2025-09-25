import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDbEntities1758258702060 implements MigrationInterface {
    name = 'AddDbEntities1758258702060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctors" DROP CONSTRAINT "FK_653c27d1b10652eb0c7bbbc4427"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_7fe1518dc780fd777669b5cb7a0"`);
        await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "specialty"`);
        await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "experience"`);
        await queryRunner.query(`ALTER TABLE "doctors" DROP CONSTRAINT "REL_653c27d1b10652eb0c7bbbc442"`);
        await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "date_of_birth"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "REL_7fe1518dc780fd777669b5cb7a"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "doctors" ADD "specialization" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctors" ADD "location" character varying NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."doctors_schedule_type_enum" AS ENUM('wave', 'stream')`);
        await queryRunner.query(`ALTER TABLE "doctors" ADD "schedule_type" "public"."doctors_schedule_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "contact" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "contact"`);
        await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "schedule_type"`);
        await queryRunner.query(`DROP TYPE "public"."doctors_schedule_type_enum"`);
        await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "specialization"`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "REL_7fe1518dc780fd777669b5cb7a" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "date_of_birth" date`);
        await queryRunner.query(`ALTER TABLE "doctors" ADD "user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "doctors" ADD CONSTRAINT "REL_653c27d1b10652eb0c7bbbc442" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "doctors" ADD "experience" integer DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "doctors" ADD "specialty" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_7fe1518dc780fd777669b5cb7a0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctors" ADD CONSTRAINT "FK_653c27d1b10652eb0c7bbbc4427" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
