import { FastifyRequest } from 'fastify';
import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { loginSchema } from './auth.schema';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(
    @Body(new ZodPiPe(loginSchema)) body,
    @Res() res,
    @Req() req: FastifyRequest,
  ) {
    return this.authService.loginUser(
      body,
      res,
      req.headers['x-forwarded-for'],
    );
  }

  @Get('logout')
  logout(@Res() res) {
    return this.authService.logoutUser(res);
  }

  @Get('user')
  @UseGuards(new AuthGuard())
  getUser() {
    return this.authService.getUser();
  }
}
