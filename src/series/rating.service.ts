import { LoggedInDto } from '@app/auth/dto/auth.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RatingDto } from './dto/rating.dto';
import { Series } from './entities/series.entity';
import { SeriesReview } from '@app/series-reviews/entities/series-review.entity';

@Injectable()
export class RatingService {
  constructor(private datasource: DataSource) {}

  async rate(
    seriesId: number,
    ratingDto: RatingDto,
    loggedInDto: LoggedInDto,
  ) {
    // create transaction
    return this.datasource.transaction(async (entityManager) => {
      const reviewRepository = entityManager.getRepository(SeriesReview);
      const seriesRepository = entityManager.getRepository(Series);

      // upsert rating
      const keys = {
        series: { id: seriesId },
        reviewer: { id: loggedInDto.id },
      };
      await reviewRepository
        .upsert(
          { rating: ratingDto.rating, comment: ratingDto.comment, ...keys },
          { conflictPaths: ['series', 'reviewer'] },
        )
        .catch(() => {
          throw new NotFoundException(`Not found: id=${seriesId}`);
        });

      // query last avg & count
      const { avg, count } = await reviewRepository
        .createQueryBuilder('review')
        .select('AVG(review.rating)', 'avg')
        .addSelect('COUNT(review.id)', 'count')
        .where('review.series_id = :seriesId', { seriesId })
        .getRawOne();

      // update Series
      await seriesRepository.update(seriesId, {
        avgRating: parseFloat(avg),
        ratingCount: parseInt(count, 10),
      });

      return seriesRepository.findOneBy({ id: seriesId });
    });
  }
}