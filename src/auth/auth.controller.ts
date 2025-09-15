import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './google-auth.guard'; 
import { Post, Body, ValidationPipe } from '@nestjs/common';
import { RegisterPatientDto } from './dto/register-patient.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard) // <-- 2. Use the new guard here
  
  async googleAuth(@Req() req) {
    // This function starts the Google OAuth flow
    // The role is passed through the state parameter by the strategy
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    // This function handles the callback after the user consents
    return this.authService.googleLogin(req);
  }
  
  @Post('register')
  async register(@Body(ValidationPipe) registerPatientDto: RegisterPatientDto) {
    return this.authService.registerPatient(registerPatientDto);
  }
}