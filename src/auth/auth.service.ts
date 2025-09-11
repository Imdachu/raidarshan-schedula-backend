import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, AuthProvider } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    const { email, firstName, lastName } = req.user;
    const role = req.query.state === 'doctor' ? UserRole.DOCTOR : UserRole.PATIENT;

    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Create new user if they don't exist
      const newUser = this.userRepository.create({
        email,
        name: `${firstName} ${lastName}`,
        provider: AuthProvider.GOOGLE,
        role,
      });
      user = await this.userRepository.save(newUser);
    }

    // Generate JWT token
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      message: 'User information from google',
      token: this.jwtService.sign(payload),
      user,
    };
  }
}