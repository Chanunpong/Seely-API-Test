import { config } from 'dotenv';
config();
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, VersioningType } from '@nestjs/common'
import { AppModule } from '../src/app.module'
import { DataSource } from 'typeorm'
import * as cookieParser from 'cookie-parser';



const request = require('supertest')

describe('Seely API (e2e)', () => {
  let app: INestApplication

  // สร้าง app ใหม่และลบข้อมูลก่อน test แต่ละตัว
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1'
    });

    app.use(cookieParser());
    
    await app.init();

    // ลบข้อมูลทั้งหมดก่อน test แต่ละตัว
    const dataSource = app.get(DataSource);
    await dataSource.query('TRUNCATE TABLE series_reviews, series, users RESTART IDENTITY CASCADE');
  });

  // ปิด app หลัง test แต่ละตัว
  afterEach(async () => {
    await app.close();
  });

  // ========================================
  // 1. AUTHENTICATION TESTS
  // ========================================
  describe('Authentication', () => {
    describe('Register', () => {
      it('should register SERIES_RECOMMENDER successfully', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'recommender_0',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          })
          .expect(201);

        expect(response.body).toHaveProperty('accessToken')
        expect(response.body).toHaveProperty('user')
        expect(response.body.user.username).toBe('recommender_0')
        expect(response.body.user.role).toBe('SERIES_RECOMMENDER')
        
        const cookies = response.headers['set-cookie']
        expect(cookies).toBeDefined()
        const cookieArray = Array.isArray(cookies) ? cookies : [cookies]
        const refreshCookie = cookieArray.find((c: string) => c.startsWith('refreshToken='))
        expect(refreshCookie).toBeDefined()
      })

      it('should register VIEWER successfully', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'viewer1',
            password: '123456',
            role: 'VIEWER'
          })
          .expect(201);

        expect(response.body.user.role).toBe('VIEWER');
      });

      it('should fail to register with duplicate username', async () => {
        // สร้าง user ก่อน
        await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'testuser',
            password: '123456',
            role: 'VIEWER'
          })
          .expect(201);

        // พยายามสร้างซ้ำ
        await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'testuser',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          })
          .expect(409);
      });

      it('should fail to register with missing fields', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'test'
          })
          .expect(400);
      });
    });

    describe('Login', () => {
      it('should login successfully', async () => {
        // สร้าง user ก่อน
        await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'testuser',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          })
          .expect(201);

        // Login
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            username: 'testuser',
            password: '123456'
          })
          .expect(201);

        expect(response.body).toHaveProperty('accessToken')
        expect(response.body).toHaveProperty('user')
        
        const cookies = response.headers['set-cookie']
        const cookieArray = Array.isArray(cookies) ? cookies : [cookies]
        const refreshCookie = cookieArray.find((c: string) => c.startsWith('refreshToken='))
        expect(refreshCookie).toBeDefined();
      });

      it('should fail login with wrong password', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'testuser',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            username: 'testuser',
            password: 'wrongpassword'
          })
          .expect(401);
      });

      it('should fail login with non-existent user', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            username: 'nonexistent',
            password: '123456'
          })
          .expect(401);
      });
    });

    describe('Refresh Token', () => {
      it('should refresh access token successfully', async () => {
        const registerRes = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'testuser',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        const cookies = registerRes.headers['set-cookie'];
        const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
        const refreshCookie = cookieArray.find((c: string) => c.startsWith('refreshToken='));
        const refreshToken = refreshCookie.split(';')[0].split('=')[1];
        console.log('Refresh Token:', refreshToken)

        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/refresh')
          .set('Cookie', `refreshToken=${refreshToken}`)
          .expect(201);

        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('user');

      });

      it('should fail refresh without refresh token', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/refresh')
          .expect(401);
      });
    });

    describe('Logout', () => {
      it('should logout successfully', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/logout')
          .expect(201);

        expect(response.body).toHaveProperty('message');
        
        const cookies = response.headers['set-cookie'];
        if (cookies) {
          const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
          const refreshCookie = cookieArray.find((c: string) => c.startsWith('refreshToken='));
          if (refreshCookie) {
            expect(refreshCookie).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/);
          }
        }
      });
    });
  });

  // ========================================
  // 2. SERIES CRUD TESTS
  // ========================================
  describe('Series Management', () => {
    describe('Create Series', () => {
      it('should create series as SERIES_RECOMMENDER', async () => {
        const registerRes = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'recommender_0',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        const token = registerRes.body.accessToken;

        const response = await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${token}`)
          .send({
            title: 'Breaking Bad',
            year: 2008,
            description: 'ซีรีย์เรื่องนี้เล่าถึงครูเคมีที่กลายเป็นผู้ผลิตยาเสพติด',
            rating: 'น 18+'
          })
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('Breaking Bad');
        expect(response.body.year).toBe(2008);
        expect(response.body.rating).toBe('น 18+');
        expect(response.body.avgRating).toBe('0.00');
        expect(response.body.ratingCount).toBe(0);
      });

      it('should fail to create series as VIEWER', async () => {
        const registerRes = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'viewer1',
            password: '123456',
            role: 'VIEWER'
          });

        const token = registerRes.body.accessToken;

        await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${token}`)
          .send({
            title: 'The Office',
            year: 2005,
            description: 'Comedy series about office life',
            rating: 'ท'
          })
          .expect(403);
      });

      it('should fail to create series without authentication', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/series')
          .send({
            title: 'The Office',
            year: 2005,
            description: 'Comedy series about office life',
            rating: 'ท'
          })
          .expect(401);
      });

      it('should fail to create series with invalid data', async () => {
        const registerRes = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'recommender_0',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${registerRes.body.accessToken}`)
          .send({
            title: 'Test',
          })
          .expect(400);
      });
    });

    describe('Get All Series', () => {
      it('should get all series without authentication', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/series')
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('meta');
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should get series with pagination', async () => {
        // สร้าง user และ series ก่อน
        const registerRes = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'recommender_0',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${registerRes.body.accessToken}`)
          .send({
            title: 'Series 1',
            year: 2020,
            description: 'Test series 1',
            rating: 'ท'
          });

        await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${registerRes.body.accessToken}`)
          .send({
            title: 'Series 2',
            year: 2021,
            description: 'Test series 2',
            rating: 'ท'
          });

        const response = await request(app.getHttpServer())
          .get('/api/v1/series?limit=1')
          .expect(200);

        expect(response.body.data.length).toBe(1);
        expect(response.body.meta.itemsPerPage).toBe(1);
      });

      it('should search series by title', async () => {
        const registerRes = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'recommender_0',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${registerRes.body.accessToken}`)
          .send({
            title: 'Breaking Bad',
            year: 2008,
            description: 'Test ดีมากกกกก กกกกกก',
            rating: 'น 18+'
          })
          .expect(201);

        const response = await request(app.getHttpServer())
          .get('/api/v1/series?search=Breaking')
          .expect(200);

        expect(response.body.data.length).toBeGreaterThan(0);
        expect(response.body.data[0].title).toContain('Breaking');
      });
    });

    describe('Get Series by ID', () => {
      it('should get series by id without authentication', async () => {
        const registerRes = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'recommender_0',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        const seriesRes = await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${registerRes.body.accessToken}`)
          .send({
            title: 'Breaking Bad',
            year: 2008,
            description: 'Test series for reading',
            rating: 'น 18+'
          })
          .expect(201);
          

        const response = await request(app.getHttpServer())
          .get(`/api/v1/series/${seriesRes.body.id}`)
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('Breaking Bad');
        expect(response.body).toHaveProperty('recommender');
      });

      it('should return null for non-existent series', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/series/99999')
          .expect(404);

          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('statusCode', 404);
      });

      it('should return 400 for invalid id', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/series/invalid')
          .expect(400);
      });
    });

    describe('Update Series', () => {
      it('should update own series as owner', async () => {
        const registerRes = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'recommender_0',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        const seriesRes = await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${registerRes.body.accessToken}`)
          .send({
            title: 'Breaking Bad',
            year: 2008,
            description: 'Original description',
            rating: 'น 18+'
          })
          .expect(201);

        const response = await request(app.getHttpServer())
          .patch(`/api/v1/series/${seriesRes.body.id}`)
          .set('Authorization', `Bearer ${registerRes.body.accessToken}`)
          .send({
            title: 'Breaking Bad - Updated',
            description: 'Updated description'
          })
          .expect(200);

        expect(response.body.title).toBe('Breaking Bad - Updated');
        expect(response.body.description).toBe('Updated description');
      });

      it('should fail to update series without authentication', async () => {
        const registerRes = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'recommender_0',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        const seriesRes = await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${registerRes.body.accessToken}`)
          .send({
            title: 'Breaking Bad',
            year: 2008,
            description: 'Test series for update',
            rating: 'น 18+'
          })
          .expect(201);

        await request(app.getHttpServer())
          .patch(`/api/v1/series/${seriesRes.body.id}`)
          .send({
            title: 'Updated Title'
          })
          .expect(401);
      });

      it('should fail to update series as non-owner', async () => {
        const owner = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'owner',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        const other = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'other',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        const seriesRes = await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${owner.body.accessToken}`)
          .send({
            title: 'Breaking Bad',
            year: 2008,
            description: 'Test series owner',
            rating: 'น 18+'
          })
          .expect(201);

        await request(app.getHttpServer())
          .patch(`/api/v1/series/${seriesRes.body.id}`)
          .set('Authorization', `Bearer ${other.body.accessToken}`)
          .send({
            title: 'Updated by Other'
          })
          .expect(403);
      });
    });

    describe('Delete Series', () => {
      it('should delete own series as owner', async () => {
        const registerRes = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'recommender_0',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        const seriesRes = await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${registerRes.body.accessToken}`)
          .send({
            title: 'Breaking Bad',
            year: 2008,
            description: 'Test series for delete',
            rating: 'น 18+'
          })
          .expect(201);

        await request(app.getHttpServer())
          .delete(`/api/v1/series/${seriesRes.body.id}`)
          .set('Authorization', `Bearer ${registerRes.body.accessToken}`)
          .expect(204);
      });

      it('should fail to delete series without authentication', async () => {
        const registerRes = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'recommender_0',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        const seriesRes = await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${registerRes.body.accessToken}`)
          .send({
            title: 'Breaking Bad',
            year: 2008,
            description: 'Test series delete auth',
            rating: 'น 18+'
          })
          .expect(201);

        await request(app.getHttpServer())
          .delete(`/api/v1/series/${seriesRes.body.id}`)
          .expect(401);
      });
    });
  });

  // ========================================
  // 3. SERIES REVIEWS TESTS
  // ========================================
  describe('Series Reviews', () => {
    describe('Rate Series', () => {
      it('should rate series as VIEWER', async () => {
        const recommender = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'recommender_0',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        const viewer = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'viewer1',
            password: '123456',
            role: 'VIEWER'
          });

        const seriesRes = await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${recommender.body.accessToken}`)
          .send({
            title: 'Breaking Bad',
            year: 2008,
            description: 'Test series for rating',
            rating: 'น 18+'
          })
          .expect(201); 

        const response = await request(app.getHttpServer())
          .put(`/api/v1/series/${seriesRes.body.id}/rating`)
          .set('Authorization', `Bearer ${viewer.body.accessToken}`)
          .send({
            rating: 9.5,
            comment: 'ซีรีย์ที่ดีมาก!'
          })
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(parseFloat(response.body.avgRating)).toBeGreaterThan(0);
        expect(response.body.ratingCount).toBe(1);
      });

      it('should update existing rating', async () => {
        const recommender = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'recommender_0',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        const viewer = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'viewer1',
            password: '123456',
            role: 'VIEWER'
          });

        const seriesRes = await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${recommender.body.accessToken}`)
          .send({
            title: 'Breaking Bad',
            year: 2008,
            description: 'Test series update rating',
            rating: 'น 18+'
          })
          .expect(201); 

        // First rating
        await request(app.getHttpServer())
          .put(`/api/v1/series/${seriesRes.body.id}/rating`)
          .set('Authorization', `Bearer ${viewer.body.accessToken}`)
          .send({
            rating: 9.5,
            comment: 'ดีมาก'
          });

        // Update rating
        const response = await request(app.getHttpServer())
          .put(`/api/v1/series/${seriesRes.body.id}/rating`)
          .set('Authorization', `Bearer ${viewer.body.accessToken}`)
          .send({
            rating: 10.0,
            comment: 'เปลี่ยนใจ! สุดยอดมาก 10/10'
          })
          .expect(200);

        expect(response.body.ratingCount).toBe(1);
        expect(parseFloat(response.body.avgRating)).toBeCloseTo(10.0, 1);
      });

      it('should fail to rate series as SERIES_RECOMMENDER', async () => {
        const recommender = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'recommender_0',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        const seriesRes = await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${recommender.body.accessToken}`)
          .send({
            title: 'Breaking Bad',
            year: 2008,
            description: 'Test series recommender',
            rating: 'น 18+'
          })
          .expect(201); 

        await request(app.getHttpServer())
          .put(`/api/v1/series/${seriesRes.body.id}/rating`)
          .set('Authorization', `Bearer ${recommender.body.accessToken}`)
          .send({
            rating: 9.0,
            comment: 'Test'
          })
          .expect(403);
      });

      it('should fail to rate without authentication', async () => {
        await request(app.getHttpServer())
          .put('/api/v1/series/1/rating')
          .send({
            rating: 9.0,
            comment: 'Test'
          })
          .expect(401);
      });

      it('should fail to rate with invalid rating value', async () => {
        const recommender = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'recommender_0',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        const viewer = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'viewer1',
            password: '123456',
            role: 'VIEWER'
          });

        const seriesRes = await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${recommender.body.accessToken}`)
          .send({
            title: 'Breaking Bad',
            year: 2008,
            description: 'Test series invalid rating',
            rating: 'น 18+'
          })
          .expect(201); 

        await request(app.getHttpServer())
          .put(`/api/v1/series/${seriesRes.body.id}/rating`)
          .set('Authorization', `Bearer ${viewer.body.accessToken}`)
          .send({
            rating: 11.0,
            comment: 'Test'
          })
          .expect(400);
      });
    });

    describe('Get Series Reviews', () => {
      it('should get all reviews for a series', async () => {
        const recommender = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'recommender_0',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        const viewer = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'viewer1',
            password: '123456',
            role: 'VIEWER'
          });

        const seriesRes = await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${recommender.body.accessToken}`)
          .send({
            title: 'Breaking Bad',
            year: 2008,
            description: 'Test series all reviews',
            rating: 'น 18+'
          })
          .expect(201); 

        await request(app.getHttpServer())
          .put(`/api/v1/series/${seriesRes.body.id}/rating`)
          .set('Authorization', `Bearer ${viewer.body.accessToken}`)
          .send({
            rating: 9.5,
            comment: 'ดีมาก'
          });

        const response = await request(app.getHttpServer())
          .get(`/api/v1/series/${seriesRes.body.id}/reviews`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0]).toHaveProperty('rating');
        expect(response.body[0]).toHaveProperty('reviewer');
      });

      it('should return empty array for series with no reviews', async () => {
        const recommender = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: 'recommender_0',
            password: '123456',
            role: 'SERIES_RECOMMENDER'
          });

        const seriesRes = await request(app.getHttpServer())
          .post('/api/v1/series')
          .set('Authorization', `Bearer ${recommender.body.accessToken}`)
          .send({
            title: 'Breaking Bad',
            year: 2008,
            description: 'Test series no reviews',
            rating: 'น 18+'
          })
          .expect(201); 

        const response = await request(app.getHttpServer())
          .get(`/api/v1/series/${seriesRes.body.id}/reviews`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
      });

      it('should return empty array for non-existent series reviews', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/series/99999/reviews')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
      });
    });
  });

  // ========================================
  // 4. INTEGRATION TEST
  // ========================================
  describe('Integration Scenarios', () => {
    it('should verify avgRating calculation with multiple reviews', async () => {
      const recommender = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: 'recommender_0',
          password: '123456',
          role: 'SERIES_RECOMMENDER'
        });

      const seriesRes = await request(app.getHttpServer())
        .post('/api/v1/series')
        .set('Authorization', `Bearer ${recommender.body.accessToken}`)
        .send({
          title: 'Test Series',
          year: 2024,
          description: 'For testing',
          rating: 'ท'
        })
        .expect(201); 

      const ratings = [10.0, 9.0, 8.0, 7.0];
      
      for (let i = 0; i < ratings.length; i++) {
        const viewer = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            username: `viewer_${i}`,
            password: '123456',
            role: 'VIEWER'
          });

        await request(app.getHttpServer())
          .put(`/api/v1/series/${seriesRes.body.id}/rating`)
          .set('Authorization', `Bearer ${viewer.body.accessToken}`)
          .send({
            rating: ratings[i],
            comment: `Rating ${ratings[i]}`
          });
      }

      const finalRes = await request(app.getHttpServer())
        .get(`/api/v1/series/${seriesRes.body.id}`)
        .expect(200);

      const expectedAvg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      expect(parseFloat(finalRes.body.avgRating)).toBeCloseTo(expectedAvg, 1);
      expect(finalRes.body.ratingCount).toBe(ratings.length);
    });
  });
});