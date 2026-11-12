import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService, LoginDto } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.validateAndLogin(dto);
  }

  @Get('seed-credentials')
  getSeedCredentials() {
    return {
      status: 'success',
      message: 'ISML LMS Enterprise 8-Portal Seed Credentials',
      data: this.authService.getAvailableRoles(),
    };
  }
}
