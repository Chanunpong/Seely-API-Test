import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, PaginateConfig, PaginateQuery } from 'nestjs-paginate';
import { Series } from './entities/series.entity';
import { CreateSeriesDto, UpdateSeriesDto } from './dto/series.dto';
import { LoggedInDto } from '../auth/dto/auth.dto';

export const paginateConfig: PaginateConfig<Series> = {
  sortableColumns: ['title', 'year', 'avgRating', 'ratingCount'],
  searchableColumns: ['title', 'description'],
};

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(Series)
    private readonly repository: Repository<Series>
    // ลบ UserRepository ออก - ใช้ UsersService แทน
  ) {}

  create(createSeriesDto: CreateSeriesDto, loggedInDto: LoggedInDto) {
    return this.repository.save({
      ...createSeriesDto,
      recommender: { id: loggedInDto.id }
    });
  }

  private queryTemplate() {
    return this.repository
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.recommender', 'recommender')
      .select([
        'series.id',
        'series.title', 
        'series.year',
        'series.description',
        'series.recommendScore',
        'series.rating',
        'series.avgRating',
        'series.ratingCount',
        'series.createdAt',
        'series.updatedAt',
        'recommender.id',
        'recommender.username'
      ]);
  }

  async search(query: PaginateQuery) {
    const page = await paginate<Series>(
      query,
      this.queryTemplate(),
      paginateConfig,
    );

    return {
      data: page.data,
      meta: page.meta,
    };
  }

  findOne(id: number) {
    return this.queryTemplate().where('series.id = :id', { id }).getOne();
  }

  async update(id: number, updateSeriesDto: UpdateSeriesDto, loggedInDto: LoggedInDto) {
    return this.repository.findOneByOrFail({ id, recommender: { id: loggedInDto.id } })
      .then(() => this.repository.save({ id, ...updateSeriesDto }))
      .catch(() => {
        throw new NotFoundException(`Not found id=${id}`)
      });
  }

  async remove(id: number, loggedInDto: LoggedInDto) {
    return this.repository.findOneByOrFail({ id, recommender: { id: loggedInDto.id } })
      .then(() => this.repository.delete({ id }))
      .catch(() => {
        throw new NotFoundException(`Not found: id=${id}`)
      });
  }
}