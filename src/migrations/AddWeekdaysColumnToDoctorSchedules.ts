import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWeekdaysColumnToDoctorSchedules1695045000000 implements MigrationInterface {
    name = 'AddWeekdaysColumnToDoctorSchedules1695045000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create enum type for weekdays if it doesn't exist
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doctor_schedules_weekdays_enum') THEN
                    CREATE TYPE "doctor_schedules_weekdays_enum" AS ENUM(
                        'sunday','monday','tuesday','wednesday','thursday','friday','saturday'
                    );
                END IF;
            END
            $$;
        `);

        // 2. Add weekdays column if it doesn't exist
        await queryRunner.query(`
            ALTER TABLE "doctor_schedules"
            ADD COLUMN IF NOT EXISTS "weekdays" "doctor_schedules_weekdays_enum" ARRAY;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the column
        await queryRunner.query(`
            ALTER TABLE "doctor_schedules" DROP COLUMN IF EXISTS "weekdays";
        `);

        // Optionally drop the enum type (only if you are sure no other columns use it)
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doctor_schedules_weekdays_enum') THEN
                    DROP TYPE "doctor_schedules_weekdays_enum";
                END IF;
            END
            $$;
        `);
    }
}
