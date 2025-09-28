import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeriesReview } from './entities/series-review.entity';
import { Series } from '@app/series/entities/series.entity';
import { CreateSeriesReviewDto, UpdateSeriesReviewDto } from './dto/series-review.dto';
import { LoggedInDto } from '@app/auth/dto/auth.dto';

@Injectable()
export class SeriesReviewsService {
  constructor(
    @InjectRepository(SeriesReview)
    private readonly repository: Repository<SeriesReview>,
    @InjectRepository(Series)
    private readonly seriesRepository: Repository<Series>,
  ) {}

  async create(createSeriesReviewDto: CreateSeriesReviewDto, loggedInDto: LoggedInDto) {
    // ตรวจสอบว่าเคยรีวิวแล้วหรือไม่
    const existingReview = await this.repository.findOne({
      where: {
        series: { id: createSeriesReviewDto.seriesId },
        reviewer: { id: loggedInDto.id }
      }
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this series');
    }

    const review = await this.repository.save({
      ...createSeriesReviewDto,
      series: { id: createSeriesReviewDto.seriesId },
      reviewer: { id: loggedInDto.id }
    });

    // อัพเดท avgRating ของ series
    await this.updateSeriesRating(createSeriesReviewDto.seriesId);

    return review;
  }

  findAllBySeriesId(seriesId: number) {
    return this.repository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .where('review.series.id = :seriesId', { seriesId })
      .select([
        'review.id',
        'review.rating', 
        'review.comment',
        'review.createdAt',
        'review.updatedAt',
        'reviewer.id',
        'reviewer.username'
      ])
      .orderBy('review.createdAt', 'DESC')
      .getMany();
  }

  async update(id: number, updateSeriesReviewDto: UpdateSeriesReviewDto, loggedInDto: LoggedInDto) {
    return this.repository.findOneByOrFail({ id, reviewer: { id: loggedInDto.id } })
      .then(async (review) => {
        const updated = await this.repository.save({ id, ...updateSeriesReviewDto });
        // อัพเดท avgRating ของ series
        await this.updateSeriesRating(review.series.id);
        return updated;
      })
      .catch(() => {
        throw new NotFoundException(`Not found id=${id}`)
      });
  }

  async remove(id: number, loggedInDto: LoggedInDto) {
    return this.repository.findOneByOrFail({ id, reviewer: { id: loggedInDto.id } })
      .then(async (review) => {
        await this.repository.delete({ id });
        // อัพเดท avgRating ของ series
        await this.updateSeriesRating(review.series.id);
      })
      .catch(() => {
        throw new NotFoundException(`Not found: id=${id}`)
      });
  }

  private async updateSeriesRating(seriesId: number) {
    const result = await this.repository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'ratingCount')
      .where('review.series.id = :seriesId', { seriesId })
      .getRawOne();

    const avgRating = parseFloat(result.avgRating) || 0;
    const ratingCount = parseInt(result.ratingCount) || 0;

    await this.seriesRepository.update(seriesId, {
      avgRating: Math.round(avgRating * 100) / 100,
      ratingCount,
    });
  }
}