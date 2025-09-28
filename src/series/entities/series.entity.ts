import { User } from '@app/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum SeriesRating {
  PROMOTE = 'ส',        // ส่งเสริม
  GENERAL = 'ท',        // ทั่วไป  
  TEEN_13 = 'น 13+',    // น 13+
  TEEN_15 = 'น 15+',    // น 15+
  TEEN_18 = 'น 18+',    // น 18+
  ADULT_20 = 'ฉ 20+'    // ฉ 20+
}

@Entity({ name: 'series' })
export class Series {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'title' })
  title: string; // เรื่องอะไร

  @Column({ name: 'year', type: 'int' })
  year: number; // ปีไหน

  @Column({ name: 'description', type: 'text' })
  description: string; // รายละเอียดการรีวิว

  @Column({ name: 'recommend_score', type: 'decimal', precision: 3, scale: 2 })
  recommendScore: number; // คะแนนของผู้แนะนำ (0.00-10.00)

  @Column({
    name: 'rating',
    type: 'enum',
    enum: SeriesRating,
    default: SeriesRating.GENERAL
  })
  rating: SeriesRating; // rating ผู้ชม

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recommender_id', referencedColumnName: 'id' })
  recommender: User; // ผู้แนะนำ

  @Column({ name: 'avg_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  avgRating: number; // คะแนนรีวิวเฉลี่ย

  @Column({ name: 'rating_count', type: 'int', default: 0 })
  ratingCount: number; // จำนวนผู้รีวิว

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}