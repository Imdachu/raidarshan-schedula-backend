import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRelationToPatient1758175965489 implements MigrationInterface {
    name = 'AddUserRelationToPatient1758175965489'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" ADD "user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "UQ_7fe1518dc780fd777669b5cb7a0" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_7fe1518dc780fd777669b5cb7a0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_7fe1518dc780fd777669b5cb7a0"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "UQ_7fe1518dc780fd777669b5cb7a0"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "user_id"`);
    }

}
