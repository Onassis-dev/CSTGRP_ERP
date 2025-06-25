import { FastifyRequest } from 'fastify';
import { Controller, Get, Post, Body, Res, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { loginSchema } from './auth.schema';
import { AuthService } from './auth.service';

@ApiTags('Auth')
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

  @Get('update')
  updatePermissions(@Res() res, @Req() req: FastifyRequest) {
    return this.authService.updatePermissions(res, req.cookies);
  }

  @Get('logout')
  logout(@Res() res) {
    return this.authService.logoutUser(res);
  }
}
