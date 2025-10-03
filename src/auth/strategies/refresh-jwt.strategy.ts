import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { LoggedInDto } from '../dto/auth.dto';

@Injectable()
export class RefreshJwtStrategy 
  extends PassportStrategy(Strategy, 'refresh-jwt') {
    
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refreshToken; // ดึง token ให้อ่านจาก cookie 
        },
      ]),
      secretOrKey: `${process.env.REFRESH_JWT_SECRET}`
    })
        console.log('REFRESH_JWT_SECRET used in strategy:', process.env.REFRESH_JWT_SECRET)
  }

  validate(user: LoggedInDto): LoggedInDto {
    return { id: user.id, username: user.username, role: user.role }
  }

}