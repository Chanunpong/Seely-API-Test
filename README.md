# Seely API - TV Series Recommendation Platform 📺

เว็บสำหรับแนะนำซีรีส์ให้คนใน community ดู และคนใน community สามารถให้คะแนน review ซีรีส์

##  Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment (your .env is already configured!)
cp .env.example .env

# 3. Start database
docker-compose up -d

# 4. Run migrations
npm run build && npm run migration:run

# 5. Seed sample data (optional)
npm run db:seed

# 6. Start development server
npm run start:dev
```

**🎉 Ready!** Visit http://localhost:3000/api for Swagger documentation

## Features

-  **Authentication & Authorization** - JWT + Refresh Token
-  **Series Management** - CRUD สำหรับผู้แนะนำซีรีส์
-  **Review System** - ผู้ชมให้คะแนนได้ พร้อมอัพเดท avgRating อัตโนมัติ
-  **Pagination** - Default 10 records
-  **Input Validation** - ใช้ nestjs-zod ทุก endpoint
-  **Owner Permission** - เฉพาะเจ้าของแก้ไข/ลบได้
-  **Public Read Access** - ทุกคนดูได้โดยไม่ต้อง login

##  Sample Data (After Seeding)

### Test Accounts
| Username     | Password    | Role                |
|-------------|-------------|---------------------|
| recommender1| password123 | SERIES_RECOMMENDER  |
| viewer1     | password123 | VIEWER              |
| viewer2     | password123 | VIEWER              |

### Sample Series
- Breaking Bad (น 18+) - Rating: 9.5/10
- Stranger Things (น 13+) - Rating: 8.7/10  
- The Office (ท) - Rating: 8.9/10
- Planet Earth (ส) - Rating: 9.4/10

## 🛠 Development

### Project Structure
```
src/
├── auth/              # JWT Authentication
├── users/             # User management  
├── series/            # TV series CRUD
├── series-reviews/    # Review system
├── common/            # Shared utilities
├── migrations/        # Database schema
└── seeds/             # Sample data
```

### Scripts
```bash
npm run start:dev      # Development server
npm run test           # Unit tests
npm run test:e2e       # Integration tests
npm run db:seed        # Add sample data
npm run db:reset       # Reset database
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - สมัครสมาชิก
- `POST /api/v1/auth/login` - เข้าสู่ระบบ
- `POST /api/v1/auth/refresh` - ต่ออายุ token
- `POST /api/v1/auth/logout` - ออกจากระบบ

### Series (ซีรีย์)
- `GET /api/v1/series` - ดูรายการซีรีย์ (pagination + search)
- `GET /api/v1/series/:id` - ดูซีรีย์แบบ detail
- `POST /api/v1/series` - สร้างซีรีย์ใหม่ (🔐 SERIES_RECOMMENDER)
- `PATCH /api/v1/series/:id` - แก้ไขซีรีย์ (🔐 owner only)
- `DELETE /api/v1/series/:id` - ลบซีรีย์ (🔐 owner only)

### Reviews (รีวิว)
- `GET /api/v1/series/:id/reviews` - ดูรีวิวทั้งหมดของซีรีย์
- `PUT /api/v1/series/:id/rating` - ให้คะแนนและรีวิวซีรีย์ (🔐 VIEWER)

##  Testing Examples

### 1. Register & Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123", 
    "role": "SERIES_RECOMMENDER"
  }'
```

### 2. Create Series
```bash
curl -X POST http://localhost:3000/api/v1/series \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Breaking Bad",
    "year": 2008,
    "description": "ซีรีย์เรื่องนี้เล่าถึงครูเคมีที่กลายเป็นผู้ผลิตยาเสพติด",
    "recommendScore": 9.5,
    "rating": "น 18+"
  }'
```

### 3. Rate Series
```bash
curl -X PUT http://localhost:3000/api/v1/series/1/rating \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "rating": 9.0,
    "comment": "ซีรีย์ที่ดีมาก เนื้อเรื่องน่าติดตาม"
  }'
```

## 🏷 Series Rating Categories

- **ส** (ส่งเสริม) - ภาพยนตร์ที่ส่งเสริมการเรียนรู้และควรส่งเสริมให้มีการดู
- **ท** (ทั่วไป) - ภาพยนตร์ที่เหมาะสมกับผู้ดูทั่วไป
- **น 13+** - ภาพยนตร์ที่เหมาะสำหรับผู้มีอายุตั้งแต่ 13 ปีขึ้นไป
- **น 15+** - ภาพยนตร์ที่เหมาะสำหรับผู้มีอายุตั้งแต่ 15 ปีขึ้นไป
- **น 18+** - ภาพยนตร์ที่เหมาะสำหรับผู้มีอายุตั้งแต่ 18 ปีขึ้นไป
- **ฉ 20+** - ภาพยนตร์เรื่องนี้ ห้ามผู้มีอายุต่ำกว่า 20 ปีดู (ตรวจบัตรประชาชน)

## Tools & Testing

- **API Documentation**: http://localhost:3000/api (Swagger)
- **Database GUI**: http://localhost:8080 (PgAdmin)
- **Postman Collection**: Import `Seely-API.postman_collection.json`
- **Development Guide**: See `DEVELOPMENT.md`

##  Business Rules Met

 **ผู้แนะนำซีรีย์** - สามารถ login และ CRUD ซีรีย์ได้  
 **ผู้ให้คะแนน** - สามารถ login และรีวิวซีรีย์ได้  
 **คนทั่วไป** - ดูรายการซีรีย์ พร้อมคะแนนเฉลี่ยและจำนวนรีวิว  
 **Auto-update** - คะแนนเฉลี่ยอัพเดทอัตโนมัติเมื่อมีรีวิวเพิ่ม  
 **Pagination** - Default 10 records ตามโจทย์  
 **Owner Permissions** - เฉพาะเจ้าของแก้ไข/ลบได้  
 **JWT Authentication** - Access + Refresh token  
 **Input Validation** - nestjs-zod ทุก endpoint  
 **REST API** - ครบทุก CRUD operations  

##  Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT + Passport
- **Validation**: nestjs-zod + Zod
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Password**: bcrypt encryption

---

**📺 Happy coding! สร้าง API สำหรับแนะนำซีรีย์ให้เสร็จสมบูรณ์แล้ว 🚀🚀🚀🚀🚀🚀🚀🚀**