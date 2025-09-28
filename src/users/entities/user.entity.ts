import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum Role {
  SERIES_RECOMMENDER = 'SERIES_RECOMMENDER', // ผู้แนะนำซีรีย์
  VIEWER = 'VIEWER' // ผู้ให้คะแนน
}

@Entity('users')
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    nullable: false,
  })
  username: string;

  @Column({
    nullable: false
  })  
  password: string;

  @Column({
    nullable: false,
    default: Role.VIEWER,
  })
  role: Role;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}