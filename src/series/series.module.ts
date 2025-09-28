import { Module } from '@nestjs/common';
import { SeriesService } from './series.service';
import { SeriesController } from './series.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Series } from './entities/series.entity';
import { UsersModule } from '@app/users/users.module';
import { RatingService } from './rating.service';
import { SeriesReview } from '@app/series-reviews/entities/series-review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Series, SeriesReview]),
    UsersModule
  ],
  controllers: [SeriesController],
  providers: [SeriesService, RatingService],
  exports: [TypeOrmModule]
})
export class SeriesModule {}