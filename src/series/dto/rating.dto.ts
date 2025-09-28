import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ratingDtoSchema = z.object({
  rating: z
    .number()
    .min(0, 'rating must be a number between 0 - 10')
    .max(10, 'rating must be a number between 0 - 10'),
  comment: z.string().optional(),
});

export class RatingDto extends createZodDto(ratingDtoSchema) {}