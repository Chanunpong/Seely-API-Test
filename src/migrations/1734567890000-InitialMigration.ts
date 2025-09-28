import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1734567890000 implements MigrationInterface {
    name = 'InitialMigration1734567890000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."users_role_enum" AS ENUM('SERIES_RECOMMENDER', 'VIEWER')
        `);
        
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL, 
                "username" character varying NOT NULL, 
                "password" character varying NOT NULL, 
                "role" "public"."users_role_enum" NOT NULL DEFAULT 'VIEWER', 
                "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, 
                "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, 
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), 
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."series_rating_enum" AS ENUM('ส', 'ท', 'น 13+', 'น 15+', 'น 18+', 'ฉ 20+')
        `);
        
        await queryRunner.query(`
            CREATE TABLE "series" (
                "id" SERIAL NOT NULL, 
                "title" character varying NOT NULL, 
                "year" integer NOT NULL, 
                "description" text NOT NULL, 
                "recommend_score" numeric(3,2) NOT NULL, 
                "rating" "public"."series_rating_enum" NOT NULL DEFAULT 'ท', 
                "avg_rating" numeric(3,2) NOT NULL DEFAULT '0', 
                "rating_count" integer NOT NULL DEFAULT '0', 
                "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, 
                "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, 
                "recommender_id" integer, 
                CONSTRAINT "PK_e725676647382eb54540d7128ba" PRIMARY KEY ("id")
            )
        `);
        
        await queryRunner.query(`
            CREATE TABLE "series_reviews" (
                "id" SERIAL NOT NULL, 
                "rating" numeric(3,2) NOT NULL, 
                "comment" text, 
                "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, 
                "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, 
                "series_id" integer, 
                "reviewer_id" integer, 
                CONSTRAINT "UQ_series_reviewer" UNIQUE ("series_id", "reviewer_id"), 
                CONSTRAINT "PK_63b96f38af9fee95bb6e92eaec1" PRIMARY KEY ("id")
            )
        `);
        
        await queryRunner.query(`
            ALTER TABLE "series" 
            ADD CONSTRAINT "FK_series_recommender" 
            FOREIGN KEY ("recommender_id") 
            REFERENCES "users"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        
        await queryRunner.query(`
            ALTER TABLE "series_reviews" 
            ADD CONSTRAINT "FK_series_reviews_series" 
            FOREIGN KEY ("series_id") 
            REFERENCES "series"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        
        await queryRunner.query(`
            ALTER TABLE "series_reviews" 
            ADD CONSTRAINT "FK_series_reviews_reviewer" 
            FOREIGN KEY ("reviewer_id") 
            REFERENCES "users"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "series_reviews" DROP CONSTRAINT "FK_series_reviews_reviewer"`);
        await queryRunner.query(`ALTER TABLE "series_reviews" DROP CONSTRAINT "FK_series_reviews_series"`);
        await queryRunner.query(`ALTER TABLE "series" DROP CONSTRAINT "FK_series_recommender"`);
        await queryRunner.query(`DROP TABLE "series_reviews"`);
        await queryRunner.query(`DROP TABLE "series"`);
        await queryRunner.query(`DROP TYPE "public"."series_rating_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }
}