import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
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
    private readonly reviewRepository: Repository<SeriesReview>,
    @InjectRepository(Series)
    private readonly seriesRepository: Repository<Series>,
  ) {}

  async findBySeriesId(seriesId: number) {
    return this.reviewRepository.find({
      where: { series: { id: seriesId } },
      relations: ['reviewer'],
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        reviewer: {
          id: true,
          username: true
        }
      }
    });
  }
}