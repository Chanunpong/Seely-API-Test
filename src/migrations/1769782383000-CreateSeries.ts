import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSeries1735689000002 implements MigrationInterface {
    name = 'CreateSeries1735689000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."series_rating_enum" 
            AS ENUM('ส', 'ท', 'น 13+', 'น 15+', 'น 18+', 'ฉ 20+')
        `);
        
        await queryRunner.query(`
            CREATE TABLE "series" (
                "id" SERIAL NOT NULL,
                "title" character varying NOT NULL,
                "year" integer NOT NULL,
                "description" text NOT NULL,
                "rating" "public"."series_rating_enum" NOT NULL DEFAULT 'ท',
                "avg_rating" numeric(4,2) NOT NULL DEFAULT '0',
                "rating_count" integer NOT NULL DEFAULT '0',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "recommender_id" integer,
                CONSTRAINT "PK_e725676647382eb54540d7128ba" PRIMARY KEY ("id")
            )
        `);
        
        await queryRunner.query(`
            ALTER TABLE "series"
            ADD CONSTRAINT "FK_series_recommender"
            FOREIGN KEY ("recommender_id")
            REFERENCES "users"("id")
            ON DELETE NO ACTION
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "series" DROP CONSTRAINT "FK_series_recommender"`);
        await queryRunner.query(`DROP TABLE "series"`);
        await queryRunner.query(`DROP TYPE "public"."series_rating_enum"`);
    }
}