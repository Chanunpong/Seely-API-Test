import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { LoggedInDto } from '../auth/dto/auth.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async findMe(@Req() req: { user: LoggedInDto }) {
    const user = await this.usersService.findByUsername(req.user.username);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}