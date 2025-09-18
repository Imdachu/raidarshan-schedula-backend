import * as bcrypt from 'bcrypt';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { ConflictException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, AuthProvider } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { NotFoundException } from '@nestjs/common';
import { Patient } from '../patients/patient.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly jwtService: JwtService,
  ) {}

  async googleLogin(req) {
    if (!req.user) {
      throw new UnauthorizedException('No user information from Google');
    }

    const { email, name } = req.user;
    const fullName = name?.givenName && name?.familyName ? `${name.givenName} ${name.familyName}` : name || 'Unknown';
    const role = req.user.state === 'doctor' ? UserRole.DOCTOR : UserRole.PATIENT;

    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Create new user if they don't exist
      const newUser = this.userRepository.create({
        email,
        name: fullName,
        provider: AuthProvider.GOOGLE,
        role,
      });
      user = await this.userRepository.save(newUser);
    }

    // Generate JWT token
    const payload = { email: user.email, sub: user.id, role: user.role, name: user.name };
    return {
      message: user ? 'Logged in successfully' : 'User created and logged in successfully',
      token: this.jwtService.sign(payload),
      user,
    };
  }
  
// Inside the AuthService class

async registerPatient(registerPatientDto: RegisterPatientDto) {

  const { email, password, name } = registerPatientDto;

  // Check if user already exists

  const existingUser = await this.userRepository.findOne({ where: { email } });

  if (existingUser) {

    throw new ConflictException('Email already exists');

  }

  // Hash the password

  const salt = await bcrypt.genSalt();

  const hashedPassword = await bcrypt.hash(password, salt);


  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`Generated OTP for ${email}: ${otp}`);
  

  // Create and save the new user

  const newUser = this.userRepository.create({

    email,

    password_hash: hashedPassword,

    name,

    role: UserRole.PATIENT, // Set role to PATIENT

    provider: AuthProvider.EMAIL, // This is a local registration, not Google
    
    otp, // Save the OTP

  });

  await this.userRepository.save(newUser);

  const newPatient = this.patientRepository.create({
    name,
    user: newUser,
  });
  await this.patientRepository.save(newPatient);


  // Remove password from the response

  delete newUser.password_hash;

  return newUser;

}
async verifyOtp(verifyOtpDto: VerifyOtpDto) {
  const { email, otp } = verifyOtpDto;

  const user = await this.userRepository.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.otp !== otp) {
    throw new UnauthorizedException('Invalid OTP');
  }

  // Mark user as verified and clear OTP
  user.is_verified = true;
  user.otp = null;
  await this.userRepository.save(user);

  // You can generate a JWT token here for automatic login after verification
  const payload = { email: user.email, sub: user.id, role: user.role };
  return {
    message: 'User verified successfully',
    token: this.jwtService.sign(payload),
  };
}
async updateOnboardingStep(userId: string, step: number) {
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  user.onboarding_step = step;
  await this.userRepository.save(user);

  return { message: 'Onboarding step updated successfully', step: user.onboarding_step };
}
        
}