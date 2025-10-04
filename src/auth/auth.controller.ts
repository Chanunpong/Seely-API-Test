import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Response } from 'express'
import { AuthService } from './auth.service'
import { LoginDto, RegisterDto, LoggedInDto } from './dto/auth.dto'
import * as ms from 'ms'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private refreshToken(res: Response, refreshToken: string) {
    const refreshExpire = process.env.REFRESH_JWT_EXPIRES_IN
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: ms(refreshExpire)
    })
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(registerDto)
    this.refreshToken(res, result.refreshToken)
    return { accessToken: result.accessToken, user: result.user }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto)
    this.refreshToken(res, result.refreshToken)
    return { accessToken: result.accessToken, user: result.user }
  }

  @UseGuards(AuthGuard('refresh-jwt'))
  @Post('refresh')
  async refresh(@Req() req: { user: LoggedInDto }, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.refreshToken(req.user)
    this.refreshToken(res, result.refreshToken)
    return { accessToken: result.accessToken, user: result.user }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken')
    return { message: 'Logout success' }
  }
}