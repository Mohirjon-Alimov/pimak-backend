import { MigrationInterface, QueryRunner } from "typeorm";

export class table1693203420137 implements MigrationInterface {
    name = 'table1693203420137'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "orders" TO "type"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "type" TO "orders"`);
    }

}
