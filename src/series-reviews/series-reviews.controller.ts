import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode } from '@nestjs/common';
import { SeriesReviewsService } from './series-reviews.service';
import { CreateSeriesReviewDto, UpdateSeriesReviewDto } from './dto/series-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoggedInDto } from '@app/auth/dto/auth.dto';
import { IdDto } from '@app/common/dto/common.dto';

@Controller('series-reviews')
export class SeriesReviewsController {
  constructor(private readonly seriesReviewsService: SeriesReviewsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createSeriesReviewDto: CreateSeriesReviewDto, @Req() req: { user: LoggedInDto }) {
    return this.seriesReviewsService.create(createSeriesReviewDto, req.user);
  }

  @Get('series/:id')
  findAllBySeriesId(@Param() idDto: IdDto) {
    return this.seriesReviewsService.findAllBySeriesId(idDto.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param() idDto: IdDto,
    @Body() updateSeriesReviewDto: UpdateSeriesReviewDto,
    @Req() req: { user: LoggedInDto }) {
    return this.seriesReviewsService.update(idDto.id, updateSeriesReviewDto, req.user);
  }

  @HttpCode(204)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param() idDto: IdDto, @Req() req: { user: LoggedInDto }) {
    return this.seriesReviewsService.remove(idDto.id, req.user);
  }
}