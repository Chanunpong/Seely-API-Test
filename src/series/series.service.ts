// src/series/series.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, PaginateConfig, PaginateQuery } from 'nestjs-paginate';
import { Series } from './entities/series.entity';
import { CreateSeriesDto, UpdateSeriesDto } from './dto/series.dto';
import { LoggedInDto } from '../auth/dto/auth.dto';
import { Role } from '@app/users/entities/user.entity';

export const paginateConfig: PaginateConfig<Series> = {
  sortableColumns: ['title', 'year', 'avgRating', 'ratingCount'],
  searchableColumns: ['title', 'description'],
  defaultLimit: 10,
};

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(Series)
    private readonly repository: Repository<Series>
  ) {}

  //  สร้างซีรีส์ - (เฉพาะ SERIES_RECOMMENDER เท่านัั่น)
  create(createSeriesDto: CreateSeriesDto, loggedInDto: LoggedInDto) {
    // ตรวจสอบ role
    if (loggedInDto.role !== Role.SERIES_RECOMMENDER) {
      throw new ForbiddenException('Only SERIES_RECOMMENDER can create series');
    }

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

async findOne(id: number) {
  const series = await this.queryTemplate()
    .where('series.id = :id', { id })
    .getOne();
  
  if (!series) {
    throw new NotFoundException(`Series with ID ${id} not found.`);
  }

  return series;

 }
   //แก้ไขซีรีส์ - เฉพาะเจ้าของเท่านั่น (SERIES_RECOMMENDER ที่สร้าง)
  async update(id: number, updateSeriesDto: UpdateSeriesDto, loggedInDto: LoggedInDto) {
    // ตรวจสอบว่าเป็น owner และเป็น SERIES_RECOMMENDER
    const series = await this.repository.findOne({
      where: { id },
      relations: ['recommender']
    });
    

    if (!series) {
      throw new NotFoundException(`Series with id ${id} not found`);
    }

    if (series.recommender.id !== loggedInDto.id) {
      throw new ForbiddenException('You can only update your own series');
    }

    if (loggedInDto.role !== Role.SERIES_RECOMMENDER) {
      throw new ForbiddenException('Only SERIES_RECOMMENDER can update series');
    }

    return this.repository.save({ 
      id, 
      ...updateSeriesDto 
    });
    
  }

   // ลบซีรีส์ - เฉพาะ owner (SERIES_RECOMMENDER ที่สร้าง)
  async remove(id: number, loggedInDto: LoggedInDto) {
    // ตรวจสอบว่าเป็น owner และเป็น SERIES_RECOMMENDER
    const series = await this.repository.findOne({
      where: { id },
      relations: ['recommender']
    });

    if (!series) {
      throw new NotFoundException(`Series with id ${id} not found`);
    }

    if (series.recommender.id !== loggedInDto.id) {
      throw new ForbiddenException('You can only delete your own series');
    }

    if (loggedInDto.role !== Role.SERIES_RECOMMENDER) {
      throw new ForbiddenException('Only SERIES_RECOMMENDER can delete series');
    }

    await this.repository.delete({ id });
  }
  
}