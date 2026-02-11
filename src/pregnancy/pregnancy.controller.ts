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
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PregnancyService } from './pregnancy.service';
import {
  CreatePregnancyDto,
  UpdatePregnancyDto,
  ConvertToChildDto,
  CreatePregnancyCheckupDto,
  CreatePregnancyMeasurementDto,
  CreatePregnancySymptomDto,
  CreatePregnancyJournalDto,
} from './dto';

@Controller('pregnancies')
@UseGuards(JwtAuthGuard)
export class PregnancyController {
  constructor(private readonly pregnancyService: PregnancyService) {}

  /**
   * Helper to get user ID from request
   */
  private getUserId(req: any): string {
    const userId = req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in token. Please log out and log in again.');
    }
    return userId;
  }

  /**
   * Create a new pregnancy profile
   */
  @Post()
  async create(@Request() req: any, @Body() dto: CreatePregnancyDto) {
    return this.pregnancyService.create(this.getUserId(req), dto);
  }

  /**
   * Get all pregnancies for the authenticated user
   */
  @Get()
  async findAll(@Request() req: any) {
    return this.pregnancyService.findAll(this.getUserId(req));
  }

  /**
   * Get active pregnancies for the authenticated user
   */
  @Get('active')
  async findActive(@Request() req: any) {
    return this.pregnancyService.findActive(this.getUserId(req));
  }

  /**
   * Get a specific pregnancy by ID
   */
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.pregnancyService.findOne(this.getUserId(req), id);
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
    return this.pregnancyService.update(this.getUserId(req), id, dto);
  }

  /**
   * Delete a pregnancy profile
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.pregnancyService.delete(this.getUserId(req), id);
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
    return this.pregnancyService.convertToChild(this.getUserId(req), id, dto);
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
    return this.pregnancyService.addCheckup(req.user.sub, id, dto);
  }

  /**
   * Get all checkups for a pregnancy
   */
  @Get(':id/checkups')
  async getCheckups(@Request() req: any, @Param('id') id: string) {
    return this.pregnancyService.getCheckups(req.user.sub, id);
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
    return this.pregnancyService.addMeasurement(req.user.sub, id, dto);
  }

  /**
   * Get all measurements for a pregnancy
   */
  @Get(':id/measurements')
  async getMeasurements(@Request() req: any, @Param('id') id: string) {
    return this.pregnancyService.getMeasurements(req.user.sub, id);
  }

  // ============================================================================
  // SYMPTOMS
  // ============================================================================

  /**
   * Save symptoms for a specific day
   */
  @Post(':id/symptoms')
  async saveSymptoms(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreatePregnancySymptomDto,
  ) {
    return this.pregnancyService.saveSymptoms(this.getUserId(req), id, dto);
  }

  /**
   * Get symptoms history
   */
  @Get(':id/symptoms')
  async getSymptomsHistory(@Request() req: any, @Param('id') id: string) {
    return this.pregnancyService.getSymptomsHistory(this.getUserId(req), id);
  }

  /**
   * Get today's symptoms
   */
  @Get(':id/symptoms/today')
  async getTodaySymptoms(@Request() req: any, @Param('id') id: string) {
    return this.pregnancyService.getTodaySymptoms(this.getUserId(req), id);
  }

  // ============================================================================
  // JOURNAL
  // ============================================================================

  /**
   * Create a journal entry
   */
  @Post(':id/journals')
  async createJournalEntry(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreatePregnancyJournalDto,
  ) {
    return this.pregnancyService.createJournalEntry(this.getUserId(req), id, dto);
  }

  /**
   * Get journal entries
   */
  @Get(':id/journals')
  async getJournalEntries(@Request() req: any, @Param('id') id: string) {
    return this.pregnancyService.getJournalEntries(this.getUserId(req), id);
  }

  /**
   * Delete a journal entry
   */
  @Delete(':id/journals/:journalId')
  @HttpCode(HttpStatus.OK)
  async deleteJournalEntry(
    @Request() req: any,
    @Param('id') id: string,
    @Param('journalId') journalId: string,
  ) {
    return this.pregnancyService.deleteJournalEntry(this.getUserId(req), id, journalId);
  }

  // ============================================================================
  // MEDICAL INFO
  // ============================================================================

  /**
   * Update medical conditions
   */
  @Put(':id/medical-conditions')
  async updateMedicalConditions(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { conditions: string[] },
  ) {
    return this.pregnancyService.updateMedicalConditions(this.getUserId(req), id, body.conditions);
  }

  /**
   * Update allergies
   */
  @Put(':id/allergies')
  async updateAllergies(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { allergies: string[] },
  ) {
    return this.pregnancyService.updateAllergies(this.getUserId(req), id, body.allergies);
  }

  /**
   * Update weight
   */
  @Put(':id/weight')
  async updateWeight(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { weight: number },
  ) {
    return this.pregnancyService.updateWeight(this.getUserId(req), id, body.weight);
  }
}
