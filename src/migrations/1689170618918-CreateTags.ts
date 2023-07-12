import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTags1689170618918 implements MigrationInterface {
    name = 'CreateTags1689170618918'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "image" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "image" SET NOT NULL`);
    }

}
