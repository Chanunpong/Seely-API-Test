import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Series } from '@app/series/entities/series.entity';
import { SeriesReview } from '@app/series-reviews/entities/series-review.entity';

export enum Role {
  SERIES_RECOMMENDER = 'SERIES_RECOMMENDER', // ผู้แนะนำซีรีย์
  VIEWER = 'VIEWER', // ผู้ให้คะแนน
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.VIEWER,
  })
  role: Role;

  @OneToMany(() => Series, (series) => series.recommender)
  recommendedSeries: Series[];

  @OneToMany(() => SeriesReview, (review) => review.reviewer)
  reviews: SeriesReview[];

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}