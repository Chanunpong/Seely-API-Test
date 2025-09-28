import { Module } from '@nestjs/common';
import { SeriesReviewsService } from './series-reviews.service';
import { SeriesReviewsController } from './series-reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeriesReview } from './entities/series-review.entity';
import { Series } from '@app/series/entities/series.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SeriesReview, Series])],
  controllers: [SeriesReviewsController],
  providers: [SeriesReviewsService],
})
export class SeriesReviewsModule {}