import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// ID Parameter DTO
const idDtoSchema = z.object({
  id: z.coerce.number().positive('ID must be a positive number'),
});

export class IdDto extends createZodDto(idDtoSchema) {}

// Pagination Query DTO
const paginationQueryDtoSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export class PaginationQueryDto extends createZodDto(paginationQueryDtoSchema) {}

// API Response DTO
const apiResponseDtoSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
});

export class ApiResponseDto extends createZodDto(apiResponseDtoSchema) {}