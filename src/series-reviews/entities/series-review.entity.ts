import { User } from '@app/users/entities/user.entity';
import { Series } from '@app/series/entities/series.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'series_reviews' })
@Unique(['series', 'reviewer']) // ป้องกันผู้ใช้รีวิวซีรีย์เดียวกันมากกว่า 1 ครั้ง
export class SeriesReview {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Series)
  @JoinColumn({ name: 'series_id', referencedColumnName: 'id' })
  series: Series;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id', referencedColumnName: 'id' })
  reviewer: User;

  @Column({ name: 'rating', type: 'decimal', precision: 4, scale: 2 })
  rating: number; // คะแนนรีวิว (0.00-10.00)

  @Column({ name: 'comment', type: 'text', nullable: true })
  comment: string; // ความคิดเห็นเพิ่มเติม (optional)

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}