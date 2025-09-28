import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, Put } from '@nestjs/common';
import { SeriesService, paginateConfig } from './series.service';
import { CreateSeriesDto, UpdateSeriesDto } from './dto/series.dto';
import { AuthGuard } from '@nestjs/passport';
import { LoggedInDto } from '@app/auth/dto/auth.dto';
import { IdDto } from '../common/dto/id.dto';
import { ApiPaginationQuery, Paginate, PaginateQuery } from 'nestjs-paginate';
import { RatingDto } from './dto/rating.dto';
import { RatingService } from './rating.service';

@Controller('series')
export class SeriesController {
  constructor(
    private readonly seriesService: SeriesService,
    private readonly ratingService: RatingService
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createSeriesDto: CreateSeriesDto, @Req() req: { user: LoggedInDto }) {
    return this.seriesService.create(createSeriesDto, req.user);
  }

  @ApiPaginationQuery(paginateConfig)
  @Get()
  search(@Paginate() query: PaginateQuery) {
    return this.seriesService.search(query);
  }

  @Get(':id')
  findOne(@Param() idDto: IdDto) {
    return this.seriesService.findOne(idDto.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param() idDto: IdDto,
    @Body() updateSeriesDto: UpdateSeriesDto,
    @Req() req: { user: LoggedInDto }) {
    return this.seriesService.update(idDto.id, updateSeriesDto, req.user);
  }

  @HttpCode(204)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param() idDto: IdDto, @Req() req: { user: LoggedInDto }) {
    return this.seriesService.remove(idDto.id, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(":id/rating")
  rating(
    @Param() idDto: IdDto,
    @Body() ratingDto: RatingDto,
    @Req() req: { user: LoggedInDto }
  ) {
    return this.ratingService.rate(idDto.id, ratingDto, req.user);
  }
}