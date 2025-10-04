# Seely API

เว็บสำหรับแนะนำซีรีส์และให้คะแนนรีวิว

## Quick Start
```bash
# Install dependencies
npm install

# Setup database (.env)
DATABASE_URL=postgresql://postgres:123456@localhost:5432/seely_db

# Run migrations
npm run build
npm run migration:run

# Start server
npm run start:dev
```

Visit http://localhost:3000/api for Swagger documentation

## Features

-  **Authentication & Authorization** - JWT + Refresh Token
-  **Series Management** - CRUD สำหรับผู้แนะนำซีรีส์
-  **Review System** - ผู้ชมให้คะแนนได้ พร้อมอัพเดท avgRating อัตโนมัติ
-  **Pagination** - Default 10 records
-  **Input Validation** - ใช้ nestjs-zod ทุก endpoint
-  **Owner Permission** - เฉพาะเจ้าของแก้ไข/ลบได้
-  **Public Read Access** - ทุกคนดูได้โดยไม่ต้อง login


## 🛠 Development

### Project Structure
```
src/
├── auth/              # Authentication & JWT
├── users/             # User management
├── series/            # Series CRUD
├── series-reviews/    # Review & rating system
├── common/            # Shared utilities
├── migrations/        # Database migrations
└── seeds/             # Seed data
```

### Scripts
```bash
npm run start:dev      # Development server
npm run test:e2e       # Integration tests
npm run db:reset       # Reset database
```

##  API Endpoints

### Authentication
- `POST /api/v1/auth/register` - สมัครสมาชิก
- `POST /api/v1/auth/login` - เข้าสู่ระบบ
- `POST /api/v1/auth/refresh` - ต่ออายุ token
- `POST /api/v1/auth/logout` - ออกจากระบบ

### Series (ซีรีย์)
- `GET /api/v1/series` - ดูรายการซีรีย์ (pagination)
- `GET /api/v1/series/:id` - ดูซีรีย์แบบ detail
- `POST /api/v1/series` - สร้างซีรีย์ใหม่ (SERIES_RECOMMENDER)
- `PATCH /api/v1/series/:id` - อัพเดทซีรีย์ (owner only)
- `DELETE /api/v1/series/:id` - ลบซีรีย์ (owner only)

### Reviews (รีวิว)
- `GET /api/v1/series/:id/reviews` - ดูรีวิวทั้งหมดของซีรีย์
- `PUT /api/v1/series/:id/rating` - ให้คะแนนและรีวิวซีรีย์ (VIEWER)

##  Testing

# E2E tests
npm run test:e2e

# Reset database
npm run db:reset
```

## Series Rating Categories

- **ส** (ส่งเสริม) - ภาพยนตร์ที่ส่งเสริมการเรียนรู้และควรส่งเสริมให้มีการดู
- **ท** (ทั่วไป) - ภาพยนตร์ที่เหมาะสมกับผู้ดูทั่วไป
- **น 13+** - ภาพยนตร์ที่เหมาะสำหรับผู้มีอายุตั้งแต่ 13 ปีขึ้นไป
- **น 15+** - ภาพยนตร์ที่เหมาะสำหรับผู้มีอายุตั้งแต่ 15 ปีขึ้นไป
- **น 18+** - ภาพยนตร์ที่เหมาะสำหรับผู้มีอายุตั้งแต่ 18 ปีขึ้นไป
- **ฉ 20+** - ภาพยนตร์เรื่องนี้ ห้ามผู้มีอายุต่ำกว่า 20 ปีดู (ตรวจบัตรประชาชน)

##  Business Rules Met

 **ผู้แนะนำซีรีย์** - สามารถ login และ CRUD ซีรีย์ได้  
 **ผู้รีวิว** - สามารถ login และรีวิวซีรีย์ได้  
 **คนทั่วไป** - ดูรายการซีรีย์ พร้อมคะแนนเฉลี่ยและจำนวนรีวิว  
 **Auto-update** - คะแนนเฉลี่ยอัพเดทอัตโนมัติเมื่อมีรีวิวเพิ่ม  
 **Pagination** - 10 records  
 **Owner Permissions** - เฉพาะเจ้าของแก้ไข/ลบได้  
 **JWT Authentication** - Access + Refresh token  
 **Input Validation** - nestjs-zod ทุก endpoint  
 **REST API** - ครบทุก CRUD operations  

##  Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT + Passport
- **Validation**: nestjs-zod
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Password**: bcrypt encryption

##  Environment Variables

DATABASE_URL=postgresql://user:password@localhost:5432/seely_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
REFRESH_JWT_SECRET=your-refresh-secret
REFRESH_JWT_EXPIRES_IN=1h
NODE_ENV=local


**ลุยเลยจร้าาาาาาาา To da moon 🚀🚀🚀🚀🚀🚀🚀🚀**