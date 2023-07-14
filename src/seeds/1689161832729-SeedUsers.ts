import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUsers1689161832729 implements MigrationInterface {
  name = 'SeedUsers1689161832729';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO tags (name) VALUES ('TypeScript'), ('nest'), ('python')`);
    await queryRunner.query(`INSERT INTO users (username, email, password) VALUES ('foo', 'foo@mail.com', '$2b$10$NECYF8DT/iy9CLSuo.PZhON.SXzEWbxAwgHO3NUdGBawpmrMkG0iG')`); // 123
    await queryRunner.query(`INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First article', 'Description for first article', 'Body for first article', 'TypeScript,nest', 1)`);
    await queryRunner.query(`INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('second-article', 'Second article', 'Description for first article', 'Body for second article', 'TypeScript,nest', 1)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {  }
}
