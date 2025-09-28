import { Module } from '@nestjs/common';
import { SeriesReviewsService } from './series-reviews.service';
import { SeriesReviewsController } from './series-reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeriesReview } from './entities/series-review.entity';
import { SeriesModule } from '@app/series/series.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SeriesReview]),
    SeriesModule
  ],
  controllers: [SeriesReviewsController],
  providers: [SeriesReviewsService],
})
export class SeriesReviewsModule {}