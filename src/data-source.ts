import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  logging: true,
  // ใช้ DATABASE_URL ถ้ามี, ไม่งั้นใช้ค่า individual
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      }),
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
};

export const dataSource = new DataSource(dataSourceOptions);