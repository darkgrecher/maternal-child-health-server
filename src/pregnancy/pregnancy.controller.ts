/**
 * Pregnancy Controller
 * 
 * REST API endpoints for managing pregnancy profiles.
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PregnancyService } from './pregnancy.service';
import {
  CreatePregnancyDto,
  UpdatePregnancyDto,
  ConvertToChildDto,
  CreatePregnancyCheckupDto,
  CreatePregnancyMeasurementDto,
} from './dto';

@Controller('pregnancies')
@UseGuards(JwtAuthGuard)
export class PregnancyController {
  constructor(private readonly pregnancyService: PregnancyService) {}

  /**
   * Create a new pregnancy profile
   */
  @Post()
  async create(@Request() req: any, @Body() dto: CreatePregnancyDto) {
    return this.pregnancyService.create(req.user.id, dto);
  }

  /**
   * Get all pregnancies for the authenticated user
   */
  @Get()
  async findAll(@Request() req: any) {
    return this.pregnancyService.findAll(req.user.id);
  }

  /**
   * Get active pregnancies for the authenticated user
   */
  @Get('active')
  async findActive(@Request() req: any) {
    return this.pregnancyService.findActive(req.user.id);
  }

  /**
   * Get a specific pregnancy by ID
   */
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.pregnancyService.findOne(req.user.id, id);
  }

  /**
   * Update a pregnancy profile
   */
  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePregnancyDto,
  ) {
    return this.pregnancyService.update(req.user.id, id, dto);
  }

  /**
   * Delete a pregnancy profile
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.pregnancyService.delete(req.user.id, id);
  }

  /**
   * Convert a pregnancy profile to a child profile after delivery
   */
  @Post(':id/convert-to-child')
  async convertToChild(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ConvertToChildDto,
  ) {
    return this.pregnancyService.convertToChild(req.user.id, id, dto);
  }

  // ============================================================================
  // CHECKUPS
  // ============================================================================

  /**
   * Add a checkup record to a pregnancy
   */
  @Post(':id/checkups')
  async addCheckup(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreatePregnancyCheckupDto,
  ) {
    return this.pregnancyService.addCheckup(req.user.id, id, dto);
  }

  /**
   * Get all checkups for a pregnancy
   */
  @Get(':id/checkups')
  async getCheckups(@Request() req: any, @Param('id') id: string) {
    return this.pregnancyService.getCheckups(req.user.id, id);
  }

  // ============================================================================
  // MEASUREMENTS
  // ============================================================================

  /**
   * Add a measurement record to a pregnancy
   */
  @Post(':id/measurements')
  async addMeasurement(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreatePregnancyMeasurementDto,
  ) {
    return this.pregnancyService.addMeasurement(req.user.id, id, dto);
  }

  /**
   * Get all measurements for a pregnancy
   */
  @Get(':id/measurements')
  async getMeasurements(@Request() req: any, @Param('id') id: string) {
    return this.pregnancyService.getMeasurements(req.user.id, id);
  }
}
