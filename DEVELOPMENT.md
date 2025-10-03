# Development Guide - Seely API

## Quick Start

### 1. Setup Environment
```bash
# Copy environment file
cp .env.example .env

# ✅ Your .env is already configured correctly!
```

### 2. Start Database
```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Or use your existing database (seely_db on localhost:5432)
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Migrations
```bash
# Build the project first
npm run build

# Run migrations to create tables
npm run migration:run
```

### 5. Seed Sample Data (Optional)
```bash
# Add sample data for testing
npm run db:seed
```

### 6. Start Development Server
```bash
npm run start:dev
```

### 7. Access API Documentation
- Swagger UI: http://localhost:3000/api
- Base API: http://localhost:3000/api/v1

## Sample Accounts (After Seeding)

| Username     | Password    | Role                |
|-------------|-------------|---------------------|
| recommender1| password123 | SERIES_RECOMMENDER  |
| viewer1     | password123 | VIEWER              |
| viewer2     | password123 | VIEWER              |

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Manual Testing with Postman
1. Import `Seely-API.postman_collection.json`
2. Use the collection to test all endpoints
3. Authentication tokens are automatically saved

## Database Management

### Reset Database
```bash
npm run db:reset
```

### Generate New Migration
```bash
npm run migration:generate -- src/migrations/YourMigrationName
```

### Revert Migration
```bash
npm run migration:revert
```

## API Endpoints Summary

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Users
- `GET /users/me` - Get current user profile

### Series (TV Shows)
- `GET /series` - List all series (with pagination & search)
- `GET /series/:id` - Get series details
- `POST /series` - Create new series (SERIES_RECOMMENDER only)
- `PATCH /series/:id` - Update series (owner only)
- `DELETE /series/:id` - Delete series (owner only)

### Reviews
- `GET /series/:id/reviews` - Get all reviews for a series
- `POST /series/:id/reviews` - Add review (VIEWER role)
- `PATCH /series/:id/reviews` - Update my review
- `DELETE /series/:id/reviews` - Delete my review

## Business Rules

1. **User Roles:**
   - `SERIES_RECOMMENDER`: Can create/edit/delete series
   - `VIEWER`: Can review series

2. **Series Rating Categories:**
   - `ส` (ส่งเสริม): Educational content
   - `ท` (ทั่วไป): General audience
   - `น 13+`: Ages 13+
   - `น 15+`: Ages 15+
   - `น 18+`: Ages 18+
   - `ฉ 20+`: Ages 20+ (ID check required)

3. **Review System:**
   - One review per user per series
   - Auto-updates `avgRating` and `ratingCount`
   - Rating scale: 0.00 - 10.00

4. **Permissions:**
   - Public can read all series and reviews
   - Only owners can modify their content
   - JWT authentication required for create/update/delete

## Project Structure

```
src/
├── auth/              # Authentication system
├── users/             # User management
├── series/            # TV series management
├── series-reviews/    # Review system
├── common/            # Shared DTOs and utilities
├── migrations/        # Database migrations
├── seeds/             # Sample data
└── main.ts           # Application entry point
```

## Development Tips

1. **Hot Reload**: Use `npm run start:dev` for auto-restart
2. **Database GUI**: Access PgAdmin at http://localhost:8080
3. **API Docs**: Always check Swagger for endpoint details
4. **Error Handling**: Check console logs and HTTP status codes
5. **Testing**: Run tests before committing changes

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps
   
   # Restart database
   docker-compose restart postgres
   ```

2. **Migration Errors**
   ```bash
   # Drop and recreate schema
   npm run db:reset
   ```

3. **Permission Denied**
   - Make sure you're using correct JWT token
   - Check user role for the operation

4. **Validation Errors**
   - Check request body against DTO schemas
   - Verify required fields are provided

### Environment Variables

Make sure your `.env` file has all required variables:
- `DATABASE_URL`
- `JWT_SECRET`
- `REFRESH_JWT_SECRET`
- `PORT`
- `NODE_ENV`

## Contributing

1. Create feature branch
2. Make changes
3. Run tests: `npm run test && npm run test:e2e`
4. Submit pull request

## Support

For issues or questions:
1. Check this documentation
2. Review API documentation at `/api`
3. Check console logs for errors
4. Test with Postman collection