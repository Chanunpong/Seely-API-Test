import { User } from '@app/users/entities/user.entity';
import { SeriesReview } from '@app/series-reviews/entities/series-review.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum SeriesRating {
  PROMOTE = 'ส', // ส่งเสริม
  GENERAL = 'ท', // ทั่วไป
  TEEN_13 = 'น 13+', // 13+
  TEEN_15 = 'น 15+', // 15+
  TEEN_18 = 'น 18+', // 18+
  ADULT_20 = 'ฉ 20+', // 20+ (ตรวจบัตร)
}

@Entity({ name: 'series' })
export class Series {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string; // เรื่องอะไร

  @Column()
  year: number; // ปีไหน

  @Column({ type: 'text' })
  description: string; // รายละเอียดรีวิว


  @Column({
    type: 'enum',
    enum: SeriesRating,
    default: SeriesRating.GENERAL,
  })
  rating: SeriesRating; // rating ผู้ชม

  @ManyToOne(() => User, (user) => user.recommendedSeries)
  @JoinColumn({ name: 'recommender_id', referencedColumnName: 'id' })
  recommender: User;

  @OneToMany(() => SeriesReview, (review) => review.series)
  reviews: SeriesReview[];

  // คะแนนรีวิวเฉลี่ย (จะคำนวณจาก reviews)
  @Column({ name: 'avg_rating', type: 'decimal', precision: 4, scale: 2, default: 0 })
  avgRating: number;

  // จำนวนผู้รีวิว
  @Column({ name: 'rating_count', type: 'int', default: 0 })
  ratingCount: number;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}