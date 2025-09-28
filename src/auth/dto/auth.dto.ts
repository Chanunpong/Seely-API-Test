import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { Role } from "@app/users/entities/user.entity";

// Login DTO
const loginDtoSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export class LoginDto extends createZodDto(loginDtoSchema) {}

// Register DTO
const registerDtoSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(Role).optional().default(Role.VIEWER),
});

export class RegisterDto extends createZodDto(registerDtoSchema) {}

// Logged In User DTO
const loggedInDtoSchema = z.object({
  id: z.number(),
  username: z.string(),
  role: z.nativeEnum(Role),
});

export class LoggedInDto extends createZodDto(loggedInDtoSchema) {}

// JWT Response DTO
const jwtResponseDtoSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: loggedInDtoSchema,
});

export class JwtResponseDto extends createZodDto(jwtResponseDtoSchema) {}