import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const idSchema = z.object({
  id: z.coerce.number('id should be number'),
});

export class IdDto extends createZodDto(idSchema) {}