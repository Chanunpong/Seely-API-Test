import { Module } from '@nestjs/common';
import { SeriesService } from './series.service';
import { SeriesController } from './series.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Series } from './entities/series.entity';
import { UsersModule } from '@app/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Series]),
    UsersModule
  ],
  controllers: [SeriesController],
  providers: [SeriesService],
  exports: [TypeOrmModule]
})
export class SeriesModule {}