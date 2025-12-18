import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  /**
   * Get all appointments for a child
   * GET /appointments/child/:childId
   */
  @Get('child/:childId')
  async getChildAppointments(@Param('childId') childId: string) {
    return this.appointmentService.getChildAppointments(childId);
  }

  /**
   * Get upcoming appointments for the current user's children
   * GET /appointments/upcoming
   */
  @Get('upcoming')
  async getUpcomingAppointments(@Request() req) {
    return this.appointmentService.getUserUpcomingAppointments(req.user.sub);
  }

  /**
   * Get a single appointment
   * GET /appointments/:id
   */
  @Get(':id')
  async getAppointment(@Param('id') id: string) {
    return this.appointmentService.getAppointment(id);
  }

  /**
   * Create a new appointment for a child
   * POST /appointments/child/:childId
   */
  @Post('child/:childId')
  async createAppointment(
    @Param('childId') childId: string,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentService.createAppointment(childId, createAppointmentDto);
  }

  /**
   * Update an appointment
   * PATCH /appointments/:id
   */
  @Patch(':id')
  async updateAppointment(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.updateAppointment(id, updateAppointmentDto);
  }

  /**
   * Cancel an appointment
   * PATCH /appointments/:id/cancel
   */
  @Patch(':id/cancel')
  async cancelAppointment(@Param('id') id: string) {
    return this.appointmentService.cancelAppointment(id);
  }

  /**
   * Complete an appointment
   * PATCH /appointments/:id/complete
   */
  @Patch(':id/complete')
  async completeAppointment(@Param('id') id: string) {
    return this.appointmentService.completeAppointment(id);
  }

  /**
   * Delete an appointment
   * DELETE /appointments/:id
   */
  @Delete(':id')
  async deleteAppointment(@Param('id') id: string) {
    return this.appointmentService.deleteAppointment(id);
  }
}
