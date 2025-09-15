import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, AuthProvider } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}