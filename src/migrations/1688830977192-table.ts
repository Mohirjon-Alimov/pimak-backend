import { MigrationInterface, QueryRunner } from "typeorm";

export class table1688830977192 implements MigrationInterface {
    name = 'table1688830977192'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "image" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "image"`);
    }

}
