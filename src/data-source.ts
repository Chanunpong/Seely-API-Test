import { DataSource } from 'typeorm';

export const dataSourceOptions = {
  type: 'postgres' as const,
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123456',
  database: 'seely_db',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: true, // ให้ TypeORM สร้าง table อัตโนมัติ
  logging: true,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;