/**
 * Vaccine Controller
 * 
 * REST API endpoints for vaccine schedule and vaccination records.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VaccineService } from './vaccine.service';
import { UpdateVaccinationRecordDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('vaccines')
export class VaccineController {
  constructor(private readonly vaccineService: VaccineService) {}

  /**
   * Get all vaccines in the schedule (public)
   * GET /vaccines
   */
  @Get()
  async getAllVaccines() {
    const vaccines = await this.vaccineService.getAllVaccines();
    return {
      success: true,
      data: vaccines,
    };
  }

  /**
   * Get vaccines grouped by age (public)
   * GET /vaccines/by-age-group
   */
  @Get('by-age-group')
  async getVaccinesByAgeGroup() {
    const groups = await this.vaccineService.getVaccinesByAgeGroup();
    return {
      success: true,
      data: groups,
    };
  }

  /**
   * Get vaccination schedule for a specific child
   * GET /vaccines/child/:childId
   */
  @Get('child/:childId')
  @UseGuards(JwtAuthGuard)
  async getChildVaccinationRecords(
    @Request() req,
    @Param('childId') childId: string,
  ) {
    const data = await this.vaccineService.getChildVaccinationRecords(
      req.user.sub,
      childId,
    );
    return {
      success: true,
      data,
    };
  }

  /**
   * Mark a vaccine as administered for a child
   * POST /vaccines/child/:childId/administer/:vaccineId
   */
  @Post('child/:childId/administer/:vaccineId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async administerVaccine(
    @Request() req,
    @Param('childId') childId: string,
    @Param('vaccineId') vaccineId: string,
    @Body() dto: UpdateVaccinationRecordDto,
  ) {
    const record = await this.vaccineService.administerVaccine(
      req.user.sub,
      childId,
      vaccineId,
      dto,
    );
    return {
      success: true,
      data: record,
    };
  }

  /**
   * Update a vaccination record
   * PATCH /vaccines/records/:recordId
   */
  @Patch('records/:recordId')
  @UseGuards(JwtAuthGuard)
  async updateVaccinationRecord(
    @Request() req,
    @Param('recordId') recordId: string,
    @Body() dto: UpdateVaccinationRecordDto,
  ) {
    const record = await this.vaccineService.updateVaccinationRecord(
      req.user.sub,
      recordId,
      dto,
    );
    return {
      success: true,
      data: record,
    };
  }

  /**
   * Seed the Sri Lanka vaccination schedule (admin only in production)
   * POST /vaccines/seed
   */
  @Post('seed')
  @HttpCode(HttpStatus.OK)
  async seedVaccineSchedule() {
    const result = await this.vaccineService.seedVaccineSchedule();
    return {
      success: true,
      data: result,
    };
  }
}
