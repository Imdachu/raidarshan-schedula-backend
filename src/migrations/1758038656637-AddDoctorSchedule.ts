import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDoctorSchedule1758038656637 implements MigrationInterface {
    name = 'AddDoctorSchedule1758038656637'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."doctor_schedules_wave_mode_enum" AS ENUM('system', 'doctor')`);
        await queryRunner.query(`CREATE TABLE "doctor_schedules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "wave_mode" "public"."doctor_schedules_wave_mode_enum", "consulting_start" TIME, "consulting_end" TIME, "slot_duration" integer, "capacity_per_slot" integer, "total_capacity" integer, "doctor_id" uuid, CONSTRAINT "PK_a1cab57bc0a680b50d06930b377" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "doctor_schedules" ADD CONSTRAINT "FK_a9562c0e3b99e62425d3356c88b" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_schedules" DROP CONSTRAINT "FK_a9562c0e3b99e62425d3356c88b"`);
        await queryRunner.query(`DROP TABLE "doctor_schedules"`);
        await queryRunner.query(`DROP TYPE "public"."doctor_schedules_wave_mode_enum"`);
    }

}
