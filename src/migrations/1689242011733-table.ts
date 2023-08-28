import { MigrationInterface, QueryRunner } from "typeorm";

export class table1689242011733 implements MigrationInterface {
    name = 'table1689242011733'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pictures" DROP CONSTRAINT "FK_c81df1a7a2d02711a092d423cfc"`);
        await queryRunner.query(`ALTER TABLE "pictures" ADD CONSTRAINT "FK_c81df1a7a2d02711a092d423cfc" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pictures" DROP CONSTRAINT "FK_c81df1a7a2d02711a092d423cfc"`);
        await queryRunner.query(`ALTER TABLE "pictures" ADD CONSTRAINT "FK_c81df1a7a2d02711a092d423cfc" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
