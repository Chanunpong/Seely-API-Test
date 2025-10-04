import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, LoggedInDto, JwtResponseDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<JwtResponseDto> {
    // ตรวจสอบว่า username ซ้ำหรือไม่
    const existingUser = await this.usersService.findByUsername(registerDto.username);

    if (existingUser) {
      throw new ConflictException('Username already use');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // สร้าง user ใหม่
    const savedUser = await this.usersService.create({
      username: registerDto.username,
      password: hashedPassword,
      role: registerDto.role,
    });

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
    const user = await this.usersService.findByUsername(loginDto.username);

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
    // ตรวจสอบว่า user ยังมีอยู่ในระบบ
    const existingUser = await this.usersService.findById(user.id);

    if (!existingUser) {
      throw new UnauthorizedException('User not found');
    }

    const payload: LoggedInDto = {
      id: existingUser.id,
      username: existingUser.username,
      role: existingUser.role,
    };

    return this.generateTokens(payload);
  }

  private generateTokens(payload: LoggedInDto): JwtResponseDto {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_JWT_SECRET,
      expiresIn: process.env.REFRESH_JWT_EXPIRES_IN,
    });

    console.log('Secret key to tokem:', process.env.REFRESH_JWT_SECRET)

    return {
      accessToken,
      refreshToken,
      user: payload,
    };
  }
}