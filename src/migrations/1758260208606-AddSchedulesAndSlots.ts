import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSchedulesAndSlots1758260208606 implements MigrationInterface {
    name = 'AddSchedulesAndSlots1758260208606'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."doctor_schedules_weekdays_enum" AS ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')`);
        await queryRunner.query(`CREATE TYPE "public"."doctor_schedules_wave_mode_enum" AS ENUM('system', 'doctor')`);
        await queryRunner.query(`CREATE TABLE "doctor_schedules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date, "weekdays" "public"."doctor_schedules_weekdays_enum" array, "wave_mode" "public"."doctor_schedules_wave_mode_enum", "consulting_start" TIME, "consulting_end" TIME, "slot_duration" integer, "capacity_per_slot" integer, "total_capacity" integer, "doctor_id" uuid, CONSTRAINT "CHK_b17907637a75c211cad58c9e83" CHECK ("date" IS NULL OR "weekdays" IS NULL), CONSTRAINT "CHK_446182d377482ff619cc474d76" CHECK ("date" IS NOT NULL OR "weekdays" IS NOT NULL), CONSTRAINT "PK_a1cab57bc0a680b50d06930b377" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "doctor_schedules" ADD CONSTRAINT "FK_a9562c0e3b99e62425d3356c88b" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_schedules" DROP CONSTRAINT "FK_a9562c0e3b99e62425d3356c88b"`);
        await queryRunner.query(`DROP TABLE "doctor_schedules"`);
        await queryRunner.query(`DROP TYPE "public"."doctor_schedules_wave_mode_enum"`);
        await queryRunner.query(`DROP TYPE "public"."doctor_schedules_weekdays_enum"`);
    }

}
