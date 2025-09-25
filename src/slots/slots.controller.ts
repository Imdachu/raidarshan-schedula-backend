import { Controller, Post, Param, Body, UseGuards, ValidationPipe, Req } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { CreateManualSlotsDto } from './dto/create-manual-slots.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('api/v1/doctors/:id/slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Post()
  @Roles(UserRole.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createManualSlots(
    @Param('id') doctorId: string,
    @Body(ValidationPipe) createManualSlotsDto: CreateManualSlotsDto,
    @Req() req
  ) {
    // Optionally, check that doctorId matches req.user.sub if you want to enforce self-only
    return this.slotsService.createManualSlots(doctorId, createManualSlotsDto);
  }
}
