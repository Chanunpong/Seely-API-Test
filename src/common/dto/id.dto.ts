import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export class IdDto extends createZodDto(idSchema) {}