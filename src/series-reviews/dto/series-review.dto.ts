import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// Create Series Review DTO
const createSeriesReviewDtoSchema = z.object({
  rating: z.number().min(0).max(10, 'Rating must be between 0-10'),
  comment: z.string().optional(),
});

export class CreateSeriesReviewDto extends createZodDto(createSeriesReviewDtoSchema) {}

// Update Series Review DTO
const updateSeriesReviewDtoSchema = createSeriesReviewDtoSchema.partial();

export class UpdateSeriesReviewDto extends createZodDto(updateSeriesReviewDtoSchema) {}