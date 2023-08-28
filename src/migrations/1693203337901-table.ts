import { MigrationInterface, QueryRunner } from "typeorm";

export class table1693203337901 implements MigrationInterface {
    name = 'table1693203337901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "orders" character varying NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "orders"`);
    }

}
