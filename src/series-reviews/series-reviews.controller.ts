import { Controller, Get, Param } from '@nestjs/common';
import { SeriesReviewsService } from './series-reviews.service';
import { IdDto } from '@app/common/dto/id.dto';

@Controller('series/:id/reviews')
export class SeriesReviewsController {
  constructor(private readonly seriesReviewsService: SeriesReviewsService) {}

  @Get()
  findBySeriesId(@Param() params: IdDto) {
    return this.seriesReviewsService.findBySeriesId(params.id);
  }
}