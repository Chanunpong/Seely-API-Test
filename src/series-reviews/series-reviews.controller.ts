import { Controller, Get, Param } from '@nestjs/common';
import { SeriesReviewsService } from './series-reviews.service';

@Controller('series/:seriesId/reviews')
export class SeriesReviewsController {
  constructor(private readonly seriesReviewsService: SeriesReviewsService) {}

  @Get()
  findBySeriesId(@Param('seriesId') seriesId: string) {
    return this.seriesReviewsService.findBySeriesId(+seriesId);
  }
}