import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@app/users/entities/user.entity';
import { LoginDto, RegisterDto, LoggedInDto, JwtResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<JwtResponseDto> {
    // ตรวจสอบว่า username ซ้ำหรือไม่
    const existingUser = await this.userRepository.findOne({
      where: { username: registerDto.username }
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // สร้าง user ใหม่
    const user = this.userRepository.create({
      username: registerDto.username,
      password: hashedPassword,
      role: registerDto.role,
    });

    const savedUser = await this.userRepository.save(user);

    // สร้าง JWT tokens
    const payload: LoggedInDto = {
      id: savedUser.id,
      username: savedUser.username,
      role: savedUser.role,
    };

    return this.generateTokens(payload);
  }

  async login(loginDto: LoginDto): Promise<JwtResponseDto> {
    // หาผู้ใช้จาก username
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // ตรวจสอบ password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // สร้าง JWT tokens
    const payload: LoggedInDto = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    return this.generateTokens(payload);
  }

  async refreshToken(user: LoggedInDto): Promise<JwtResponseDto> {
    // ตรวจสอบว่าผู้ใช้ยังคงมีอยู่ในระบบ
    const existingUser = await this.userRepository.findOne({
      where: { id: user.id }
    });

    if (!existingUser) {
      throw new UnauthorizedException('User not found');
    }

    // สร้าง token ใหม่
    return this.generateTokens(user);
  }

  private async generateTokens(payload: LoggedInDto): Promise<JwtResponseDto> {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'seely-jwt-secret',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'seely-jwt-refresh-secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: payload,
    };
  }
}