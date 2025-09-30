import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSeriesReviews1735689000003 implements MigrationInterface {
    name = 'CreateSeriesReviews1735689000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "series_reviews" (
                "id" SERIAL NOT NULL,
                "rating" numeric(4,2) NOT NULL,
                "comment" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "series_id" integer,
                "reviewer_id" integer,
                CONSTRAINT "UQ_series_reviewer" UNIQUE ("series_id", "reviewer_id"),
                CONSTRAINT "PK_63b96f38af9fee95bb6e92eaec1" PRIMARY KEY ("id")
            )
        `);
        
        await queryRunner.query(`
            ALTER TABLE "series_reviews"
            ADD CONSTRAINT "FK_series_reviews_series"
            FOREIGN KEY ("series_id")
            REFERENCES "series"("id")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);
        
        await queryRunner.query(`
            ALTER TABLE "series_reviews"
            ADD CONSTRAINT "FK_series_reviews_reviewer"
            FOREIGN KEY ("reviewer_id")
            REFERENCES "users"("id")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "series_reviews" DROP CONSTRAINT "FK_series_reviews_reviewer"`);
        await queryRunner.query(`ALTER TABLE "series_reviews" DROP CONSTRAINT "FK_series_reviews_series"`);
        await queryRunner.query(`DROP TABLE "series_reviews"`);
    }
}