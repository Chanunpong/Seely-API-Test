import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// Create Series Review DTO
const createSeriesReviewDtoSchema = z.object({
  seriesId: z.number().int().positive('Series ID must be a positive number'),
  rating: z.number().min(0).max(10, 'Rating must be between 0-10'),
  comment: z.string().optional(),
});

export class CreateSeriesReviewDto extends createZodDto(createSeriesReviewDtoSchema) {}

// Update Series Review DTO
const updateSeriesReviewDtoSchema = z.object({
  rating: z.number().min(0).max(10, 'Rating must be between 0-10').optional(),
  comment: z.string().optional(),
});

export class UpdateSeriesReviewDto extends createZodDto(updateSeriesReviewDtoSchema) {}

// Series Review Response DTO
const seriesReviewResponseDtoSchema = z.object({
  id: z.number(),
  rating: z.number(),
  comment: z.string().nullable(),
  reviewer: z.object({
    id: z.number(),
    username: z.string(),
  }),
  series: z.object({
    id: z.number(),
    title: z.string(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class SeriesReviewResponseDto extends createZodDto(seriesReviewResponseDtoSchema) {}