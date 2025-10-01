import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { SeriesRating } from "@app/series/entities/series.entity";

// Create Series DTO
const createSeriesDtoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 5, 'Invalid year'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  rating: z.nativeEnum(SeriesRating).default(SeriesRating.GENERAL),
});

export class CreateSeriesDto extends createZodDto(createSeriesDtoSchema) {}

// Update Series DTO  
const updateSeriesDtoSchema = createSeriesDtoSchema.partial();

export class UpdateSeriesDto extends createZodDto(updateSeriesDtoSchema) {}