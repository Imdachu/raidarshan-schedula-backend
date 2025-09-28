import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../users/user.entity';

import { LoginDto } from './dto/login.dto';

import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './google-auth.guard'; 
import { Post, Body, ValidationPipe } from '@nestjs/common';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Patch, Request } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';


@Controller('api/v1/auth')
export class AuthController {
  @Post('register-doctor')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async registerDoctor(@Body(ValidationPipe) registerDoctorDto: RegisterDoctorDto) {
    return this.authService.registerDoctor(registerDoctorDto);
  }

  // Temporary endpoint for initial admin creation - REMOVE IN PRODUCTION
  @Post('create-initial-admin')
  async createInitialAdmin(@Body(ValidationPipe) registerDoctorDto: RegisterDoctorDto) {
    // Check if any admin users already exist
    const existingAdmins = await this.authService.countAdminUsers();
    if (existingAdmins > 0) {
      return { 
        error: 'Admin users already exist. Use register-doctor endpoint with admin JWT.' 
      };
    }
    return this.authService.registerDoctor(registerDoctorDto);
  }
  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
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

  @Post('verify-otp')
  async verifyOtp(@Body(ValidationPipe) verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Patch('onboarding')
  @UseGuards(JwtAuthGuard)
  async updateOnboarding(@Request() req, @Body(ValidationPipe) updateOnboardingDto: UpdateOnboardingDto) {
    const userId = req.user.userId; // userId is from the JWT payload
    return this.authService.updateOnboardingStep(userId, updateOnboardingDto.step);
  }
}