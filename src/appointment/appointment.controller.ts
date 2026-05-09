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

  private getActor(req: any): { id: string; actorType: 'user' | 'midwife' } {
    return { id: req.user.sub, actorType: req.user.actorType || 'user' };
  }

  /**
   * Get all appointments for the current actor
   * GET /appointments
   */
  @Get()
  async getAppointments(@Request() req) {
    const data = await this.appointmentService.getActorAppointments(this.getActor(req));
    return { success: true, data };
  }

  /**
   * Get all appointments for a child
   * GET /appointments/child/:childId
   */
  @Get('child/:childId')
  async getChildAppointments(@Request() req, @Param('childId') childId: string) {
    return this.appointmentService.getChildAppointments(this.getActor(req), childId);
  }

  /**
   * Get upcoming appointments for the current user's children
   * GET /appointments/upcoming
   */
  @Get('upcoming')
  async getUpcomingAppointments(@Request() req) {
    return this.appointmentService.getUpcomingAppointments(this.getActor(req));
  }

  /**
   * Get a single appointment
   * GET /appointments/:id
   */
  @Get(':id')
  async getAppointment(@Request() req, @Param('id') id: string) {
    return this.appointmentService.getAppointment(this.getActor(req), id);
  }

  /**
   * Create a new appointment for a child
   * POST /appointments/child/:childId
   */
  @Post('child/:childId')
  async createAppointment(
    @Request() req,
    @Param('childId') childId: string,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentService.createAppointment(this.getActor(req), childId, createAppointmentDto);
  }

  /**
   * Update an appointment
   * PATCH /appointments/:id
   */
  @Patch(':id')
  async updateAppointment(
    @Request() req,
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.updateAppointment(this.getActor(req), id, updateAppointmentDto);
  }

  /**
   * Cancel an appointment
   * PATCH /appointments/:id/cancel
   */
  @Patch(':id/cancel')
  async cancelAppointment(@Request() req, @Param('id') id: string) {
    return this.appointmentService.cancelAppointment(this.getActor(req), id);
  }

  /**
   * Complete an appointment
   * PATCH /appointments/:id/complete
   */
  @Patch(':id/complete')
  async completeAppointment(@Request() req, @Param('id') id: string) {
    return this.appointmentService.completeAppointment(this.getActor(req), id);
  }

  /**
   * Delete an appointment
   * DELETE /appointments/:id
   */
  @Delete(':id')
  async deleteAppointment(@Request() req, @Param('id') id: string) {
    return this.appointmentService.deleteAppointment(this.getActor(req), id);
  }
}
