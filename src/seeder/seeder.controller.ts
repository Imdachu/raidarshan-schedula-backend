import { Controller, Post, Get } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('seed')
export class SeederController {
  constructor(private readonly seederService: SeederService) {}

  @Post()
  async runSeeder() {
    try {
      await this.seederService.seed();
      return { message: 'Seeding completed successfully!' };
    } catch (error) {
      return { 
        message: 'Seeding failed', 
        error: error.message 
      };
    }
  }

  @Get('status')
  async checkSeedStatus() {
    // Check if admin user exists
    const adminExists = await this.seederService.checkAdminExists();
    const doctorCount = await this.seederService.getDoctorCount();
    const patientExists = await this.seederService.checkPatientExists();
    
    return {
      adminExists,
      doctorCount,
      patientExists,
      needsSeeding: !adminExists || doctorCount === 0 || !patientExists
    };
  }
}