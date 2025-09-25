import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAssignedDateToAppointments1695220000000 implements MigrationInterface {
    name = 'AddAssignedDateToAppointments1695220000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "assigned_date" date NOT NULL DEFAULT CURRENT_DATE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "assigned_date"`);
    }
}
