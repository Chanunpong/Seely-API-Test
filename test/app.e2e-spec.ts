import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Seely API (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let seriesId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1'
    });
    
    await app.init();

    // ลบข้อมูลเก่าก่อน test
    const dataSource = app.get(DataSource);
    await dataSource.query('TRUNCATE TABLE series_reviews, series, users RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('/auth/register (POST)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          role: 'SERIES_RECOMMENDER'
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('testuser');
      
      accessToken = response.body.accessToken;
      console.log('✅ Saved accessToken');
    });

    it('/auth/login (POST)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
    });
  });

  describe('Series', () => {
    it('/series (POST) - Create series', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/series')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Breaking Bad',
          year: 2008,
          description: 'ซีรีย์เรื่องนี้เล่าถึงครูเคมีที่กลายเป็นผู้ผลิตยาเสพติด',
          recommendScore: 9.5,
          rating: 'น 18+'
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Breaking Bad');
      
      seriesId = response.body.id;
      console.log('✅ Saved seriesId:', seriesId);
    });

    it('/series (GET) - Get all series', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/series')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('/series/:id (GET) - Get series by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/series/${seriesId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Breaking Bad');
    });
  });

  describe('Series Reviews', () => {
    it('/series/:id/rating (PUT) - Rate series', async () => {
      // Register viewer
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: 'viewer1',
          password: 'password123',
          role: 'VIEWER'
        })
        .expect(201);

      // Login as viewer
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: 'viewer1',
          password: 'password123'
        })
        .expect(201);

      const viewerToken = loginResponse.body.accessToken;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/series/${seriesId}/rating`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          rating: 9.0,
          comment: 'ซีรีย์ที่ดีมาก เนื้อเรื่องน่าติดตาม'
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.avgRating).toBeGreaterThan(0);
      expect(response.body.ratingCount).toBe(1);
    });

    it('/series/:id/reviews (GET) - Get series reviews', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/series/${seriesId}/reviews`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});