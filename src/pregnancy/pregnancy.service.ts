/**
 * Pregnancy Service
 * 
 * Service for managing pregnancy profiles and converting them to child profiles.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePregnancyDto,
  UpdatePregnancyDto,
  ConvertToChildDto,
  CreatePregnancyCheckupDto,
  CreatePregnancyMeasurementDto,
} from './dto';
import {
  Gender as PrismaGender,
  BloodType as PrismaBloodType,
  DeliveryType as PrismaDeliveryType,
  PregnancyStatus as PrismaPregnancyStatus,
} from '@prisma/client';

@Injectable()
export class PregnancyService {
  private readonly logger = new Logger(PregnancyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Map blood type to Prisma enum
   */
  private mapBloodType(bloodType?: string): PrismaBloodType | undefined {
    if (!bloodType) return undefined;
    const mapping: Record<string, PrismaBloodType> = {
      'A+': 'A_POSITIVE',
      'A-': 'A_NEGATIVE',
      'B+': 'B_POSITIVE',
      'B-': 'B_NEGATIVE',
      'AB+': 'AB_POSITIVE',
      'AB-': 'AB_NEGATIVE',
      'O+': 'O_POSITIVE',
      'O-': 'O_NEGATIVE',
      'unknown': 'unknown',
    };
    return mapping[bloodType] || 'unknown';
  }

  /**
   * Map Prisma blood type to display format
   */
  private mapBloodTypeToDisplay(bloodType?: PrismaBloodType | null): string {
    if (!bloodType) return 'unknown';
    const mapping: Record<PrismaBloodType, string> = {
      'A_POSITIVE': 'A+',
      'A_NEGATIVE': 'A-',
      'B_POSITIVE': 'B+',
      'B_NEGATIVE': 'B-',
      'AB_POSITIVE': 'AB+',
      'AB_NEGATIVE': 'AB-',
      'O_POSITIVE': 'O+',
      'O_NEGATIVE': 'O-',
      'unknown': 'unknown',
    };
    return mapping[bloodType] || 'unknown';
  }

  /**
   * Calculate pregnancy week from expected delivery date
   */
  private calculatePregnancyWeek(expectedDeliveryDate: Date): number {
    const today = new Date();
    const edd = new Date(expectedDeliveryDate);
    
    // Pregnancy is typically 40 weeks from LMP
    // EDD is 40 weeks from LMP, so current week = 40 - (weeks until EDD)
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksUntilEDD = Math.floor((edd.getTime() - today.getTime()) / msPerWeek);
    const currentWeek = 40 - weeksUntilEDD;
    
    return Math.max(1, Math.min(42, currentWeek));
  }

  /**
   * Calculate trimester from week
   */
  private calculateTrimester(week: number): number {
    if (week <= 12) return 1;
    if (week <= 27) return 2;
    return 3;
  }

  /**
   * Create a new pregnancy profile
   */
  async create(userId: string, dto: CreatePregnancyDto) {
    this.logger.log(`Creating pregnancy profile for user: ${userId}`);

    // Validate userId
    if (!userId) {
      throw new Error('User ID is required to create a pregnancy profile');
    }

    const expectedDeliveryDate = new Date(dto.expectedDeliveryDate);
    const currentWeek = this.calculatePregnancyWeek(expectedDeliveryDate);
    const trimester = this.calculateTrimester(currentWeek);

    const pregnancy = await this.prisma.pregnancy.create({
      data: {
        user: {
          connect: { id: userId },
        },
        motherFirstName: dto.motherFirstName,
        motherLastName: dto.motherLastName,
        motherDateOfBirth: new Date(dto.motherDateOfBirth),
        motherBloodType: this.mapBloodType(dto.motherBloodType),
        motherPhotoUri: dto.motherPhotoUri,
        expectedDeliveryDate,
        lastMenstrualPeriod: dto.lastMenstrualPeriod ? new Date(dto.lastMenstrualPeriod) : null,
        conceptionDate: dto.conceptionDate ? new Date(dto.conceptionDate) : null,
        status: 'active',
        currentWeek,
        trimester,
        gravida: dto.gravida,
        para: dto.para,
        prePregnancyWeight: dto.prePregnancyWeight,
        currentWeight: dto.currentWeight,
        height: dto.height,
        isHighRisk: dto.isHighRisk || false,
        riskFactors: dto.riskFactors || [],
        medicalConditions: dto.medicalConditions || [],
        allergies: dto.allergies || [],
        medications: dto.medications || [],
        hospitalName: dto.hospitalName,
        obgynName: dto.obgynName,
        obgynContact: dto.obgynContact,
        midwifeName: dto.midwifeName,
        midwifeContact: dto.midwifeContact,
        expectedGender: dto.expectedGender as PrismaGender | undefined,
        babyNickname: dto.babyNickname,
        numberOfBabies: dto.numberOfBabies || 1,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
        emergencyContactRelation: dto.emergencyContactRelation,
      },
    });

    return this.formatPregnancy(pregnancy);
  }

  /**
   * Get all pregnancies for a user
   */
  async findAll(userId: string) {
    const pregnancies = await this.prisma.pregnancy.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        pregnancyCheckups: {
          orderBy: { checkupDate: 'desc' },
          take: 1,
        },
        pregnancyMeasurements: {
          orderBy: { measurementDate: 'desc' },
          take: 1,
        },
      },
    });

    return pregnancies.map(p => this.formatPregnancy(p));
  }

  /**
   * Get active pregnancies for a user
   */
  async findActive(userId: string) {
    const pregnancies = await this.prisma.pregnancy.findMany({
      where: { 
        userId,
        status: 'active',
      },
      orderBy: { expectedDeliveryDate: 'asc' },
      include: {
        pregnancyCheckups: {
          orderBy: { checkupDate: 'desc' },
          take: 3,
        },
        pregnancyMeasurements: {
          orderBy: { measurementDate: 'desc' },
          take: 5,
        },
      },
    });

    return pregnancies.map(p => this.formatPregnancy(p));
  }

  /**
   * Get a single pregnancy by ID
   */
  async findOne(userId: string, pregnancyId: string) {
    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
      include: {
        pregnancyCheckups: {
          orderBy: { checkupDate: 'desc' },
        },
        pregnancyMeasurements: {
          orderBy: { measurementDate: 'desc' },
        },
      },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    return this.formatPregnancy(pregnancy);
  }

  /**
   * Update a pregnancy profile
   */
  async update(userId: string, pregnancyId: string, dto: UpdatePregnancyDto) {
    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    // Calculate new week/trimester if EDD changed
    let currentWeek = pregnancy.currentWeek;
    let trimester = pregnancy.trimester;
    if (dto.expectedDeliveryDate) {
      currentWeek = this.calculatePregnancyWeek(new Date(dto.expectedDeliveryDate));
      trimester = this.calculateTrimester(currentWeek);
    }

    const updated = await this.prisma.pregnancy.update({
      where: { id: pregnancyId },
      data: {
        ...(dto.motherFirstName && { motherFirstName: dto.motherFirstName }),
        ...(dto.motherLastName && { motherLastName: dto.motherLastName }),
        ...(dto.motherDateOfBirth && { motherDateOfBirth: new Date(dto.motherDateOfBirth) }),
        ...(dto.motherBloodType && { motherBloodType: this.mapBloodType(dto.motherBloodType) }),
        ...(dto.motherPhotoUri !== undefined && { motherPhotoUri: dto.motherPhotoUri }),
        ...(dto.expectedDeliveryDate && { 
          expectedDeliveryDate: new Date(dto.expectedDeliveryDate),
          currentWeek,
          trimester,
        }),
        ...(dto.lastMenstrualPeriod && { lastMenstrualPeriod: new Date(dto.lastMenstrualPeriod) }),
        ...(dto.conceptionDate && { conceptionDate: new Date(dto.conceptionDate) }),
        ...(dto.gravida !== undefined && { gravida: dto.gravida }),
        ...(dto.para !== undefined && { para: dto.para }),
        ...(dto.prePregnancyWeight !== undefined && { prePregnancyWeight: dto.prePregnancyWeight }),
        ...(dto.currentWeight !== undefined && { currentWeight: dto.currentWeight }),
        ...(dto.height !== undefined && { height: dto.height }),
        ...(dto.isHighRisk !== undefined && { isHighRisk: dto.isHighRisk }),
        ...(dto.riskFactors && { riskFactors: dto.riskFactors }),
        ...(dto.medicalConditions && { medicalConditions: dto.medicalConditions }),
        ...(dto.allergies && { allergies: dto.allergies }),
        ...(dto.medications && { medications: dto.medications }),
        ...(dto.hospitalName !== undefined && { hospitalName: dto.hospitalName }),
        ...(dto.obgynName !== undefined && { obgynName: dto.obgynName }),
        ...(dto.obgynContact !== undefined && { obgynContact: dto.obgynContact }),
        ...(dto.midwifeName !== undefined && { midwifeName: dto.midwifeName }),
        ...(dto.midwifeContact !== undefined && { midwifeContact: dto.midwifeContact }),
        ...(dto.expectedGender && { expectedGender: dto.expectedGender as PrismaGender }),
        ...(dto.babyNickname !== undefined && { babyNickname: dto.babyNickname }),
        ...(dto.numberOfBabies !== undefined && { numberOfBabies: dto.numberOfBabies }),
        ...(dto.emergencyContactName !== undefined && { emergencyContactName: dto.emergencyContactName }),
        ...(dto.emergencyContactPhone !== undefined && { emergencyContactPhone: dto.emergencyContactPhone }),
        ...(dto.emergencyContactRelation !== undefined && { emergencyContactRelation: dto.emergencyContactRelation }),
        ...(dto.deliveryDate && { deliveryDate: new Date(dto.deliveryDate) }),
        ...(dto.deliveryType && { deliveryType: dto.deliveryType as PrismaDeliveryType }),
        ...(dto.deliveryNotes !== undefined && { deliveryNotes: dto.deliveryNotes }),
      },
    });

    return this.formatPregnancy(updated);
  }

  /**
   * Delete a pregnancy profile
   */
  async delete(userId: string, pregnancyId: string) {
    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    await this.prisma.pregnancy.delete({
      where: { id: pregnancyId },
    });

    return { message: 'Pregnancy profile deleted successfully' };
  }

  /**
   * Convert a pregnancy profile to a child profile
   * This is called when the baby is born
   */
  async convertToChild(userId: string, pregnancyId: string, dto: ConvertToChildDto) {
    this.logger.log(`Converting pregnancy ${pregnancyId} to child profile`);

    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    if (pregnancy.status === 'converted') {
      throw new BadRequestException('This pregnancy has already been converted to a child profile');
    }

    // Create child profile
    const child = await this.prisma.child.create({
      data: {
        userId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender as PrismaGender,
        chdrNumber: dto.chdrNumber,
        photoUri: dto.photoUri,
        birthWeight: dto.birthWeight,
        birthHeight: dto.birthHeight,
        birthHeadCircumference: dto.birthHeadCircumference,
        bloodType: this.mapBloodType(dto.bloodType),
        placeOfBirth: dto.placeOfBirth || pregnancy.hospitalName,
        deliveryType: dto.deliveryType as PrismaDeliveryType | undefined,
        allergies: dto.allergies || [],
        specialConditions: dto.specialConditions || [],
        // Transfer mother's info from pregnancy
        motherName: `${pregnancy.motherFirstName} ${pregnancy.motherLastName}`,
        emergencyContact: pregnancy.emergencyContactPhone,
        address: dto.address,
      },
    });

    // Update pregnancy status
    await this.prisma.pregnancy.update({
      where: { id: pregnancyId },
      data: {
        status: 'converted',
        convertedToChildId: child.id,
        deliveryDate: new Date(dto.dateOfBirth),
        deliveryType: dto.deliveryType as PrismaDeliveryType | undefined,
        deliveryNotes: dto.deliveryNotes,
      },
    });

    this.logger.log(`Successfully converted pregnancy ${pregnancyId} to child ${child.id}`);

    return {
      pregnancy: this.formatPregnancy(await this.prisma.pregnancy.findUnique({
        where: { id: pregnancyId },
      })),
      child: this.formatChild(child),
    };
  }

  /**
   * Add a checkup record
   */
  async addCheckup(userId: string, pregnancyId: string, dto: CreatePregnancyCheckupDto) {
    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    const checkup = await this.prisma.pregnancyCheckup.create({
      data: {
        pregnancyId,
        checkupDate: new Date(dto.checkupDate),
        weekOfPregnancy: dto.weekOfPregnancy,
        weight: dto.weight,
        bloodPressureSystolic: dto.bloodPressureSystolic,
        bloodPressureDiastolic: dto.bloodPressureDiastolic,
        fundalHeight: dto.fundalHeight,
        fetalHeartRate: dto.fetalHeartRate,
        fetalWeight: dto.fetalWeight,
        fetalLength: dto.fetalLength,
        amnioticFluid: dto.amnioticFluid,
        placentaPosition: dto.placentaPosition,
        urineProtein: dto.urineProtein,
        urineGlucose: dto.urineGlucose,
        hemoglobin: dto.hemoglobin,
        notes: dto.notes,
        recommendations: dto.recommendations || [],
        nextCheckupDate: dto.nextCheckupDate ? new Date(dto.nextCheckupDate) : null,
        providerName: dto.providerName,
        location: dto.location,
      },
    });

    // Update pregnancy with latest weight if provided
    if (dto.weight) {
      await this.prisma.pregnancy.update({
        where: { id: pregnancyId },
        data: { currentWeight: dto.weight },
      });
    }

    return this.formatCheckup(checkup);
  }

  /**
   * Get checkups for a pregnancy
   */
  async getCheckups(userId: string, pregnancyId: string) {
    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    const checkups = await this.prisma.pregnancyCheckup.findMany({
      where: { pregnancyId },
      orderBy: { checkupDate: 'desc' },
    });

    return checkups.map(c => this.formatCheckup(c));
  }

  /**
   * Add a measurement record
   */
  async addMeasurement(userId: string, pregnancyId: string, dto: CreatePregnancyMeasurementDto) {
    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    const measurement = await this.prisma.pregnancyMeasurement.create({
      data: {
        pregnancyId,
        measurementDate: new Date(dto.measurementDate),
        weekOfPregnancy: dto.weekOfPregnancy,
        weight: dto.weight,
        bellyCircumference: dto.bellyCircumference,
        bloodPressureSystolic: dto.bloodPressureSystolic,
        bloodPressureDiastolic: dto.bloodPressureDiastolic,
        symptoms: dto.symptoms || [],
        mood: dto.mood,
        notes: dto.notes,
      },
    });

    // Update pregnancy with latest weight
    await this.prisma.pregnancy.update({
      where: { id: pregnancyId },
      data: { currentWeight: dto.weight },
    });

    return this.formatMeasurement(measurement);
  }

  /**
   * Get measurements for a pregnancy
   */
  async getMeasurements(userId: string, pregnancyId: string) {
    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    const measurements = await this.prisma.pregnancyMeasurement.findMany({
      where: { pregnancyId },
      orderBy: { measurementDate: 'desc' },
    });

    return measurements.map(m => this.formatMeasurement(m));
  }

  // ============================================================================
  // SYMPTOMS MANAGEMENT
  // ============================================================================

  /**
   * Add or update symptoms for a specific day
   */
  async saveSymptoms(userId: string, pregnancyId: string, dto: any) {
    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    const date = dto.date ? new Date(dto.date) : new Date();
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    // Check if a symptom record already exists for this day
    const existingRecord = await this.prisma.pregnancySymptom.findFirst({
      where: {
        pregnancyId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    let symptom;
    if (existingRecord) {
      // Update existing record
      symptom = await this.prisma.pregnancySymptom.update({
        where: { id: existingRecord.id },
        data: {
          symptoms: dto.symptoms,
          weekOfPregnancy: dto.weekOfPregnancy,
          notes: dto.notes,
        },
      });
    } else {
      // Create new record
      symptom = await this.prisma.pregnancySymptom.create({
        data: {
          pregnancyId,
          date: dto.date ? new Date(dto.date) : new Date(),
          weekOfPregnancy: dto.weekOfPregnancy,
          symptoms: dto.symptoms,
          notes: dto.notes,
        },
      });
    }

    return this.formatSymptom(symptom);
  }

  /**
   * Get symptoms history
   */
  async getSymptomsHistory(userId: string, pregnancyId: string, limit?: number) {
    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    const symptoms = await this.prisma.pregnancySymptom.findMany({
      where: { pregnancyId },
      orderBy: { date: 'desc' },
      take: limit || 30,
    });

    return symptoms.map(s => this.formatSymptom(s));
  }

  /**
   * Get today's symptoms
   */
  async getTodaySymptoms(userId: string, pregnancyId: string) {
    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const symptom = await this.prisma.pregnancySymptom.findFirst({
      where: {
        pregnancyId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return symptom ? this.formatSymptom(symptom) : null;
  }

  // ============================================================================
  // JOURNAL MANAGEMENT
  // ============================================================================

  /**
   * Create a journal entry
   */
  async createJournalEntry(userId: string, pregnancyId: string, dto: any) {
    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    const journal = await this.prisma.pregnancyJournal.create({
      data: {
        pregnancyId,
        date: dto.date ? new Date(dto.date) : new Date(),
        weekOfPregnancy: dto.weekOfPregnancy,
        title: dto.title,
        content: dto.content,
        mood: dto.mood,
      },
    });

    return this.formatJournal(journal);
  }

  /**
   * Get journal entries
   */
  async getJournalEntries(userId: string, pregnancyId: string, limit?: number) {
    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    const journals = await this.prisma.pregnancyJournal.findMany({
      where: { pregnancyId },
      orderBy: { date: 'desc' },
      take: limit || 50,
    });

    return journals.map(j => this.formatJournal(j));
  }

  /**
   * Delete a journal entry
   */
  async deleteJournalEntry(userId: string, pregnancyId: string, journalId: string) {
    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    const journal = await this.prisma.pregnancyJournal.findUnique({
      where: { id: journalId },
    });

    if (!journal || journal.pregnancyId !== pregnancyId) {
      throw new NotFoundException('Journal entry not found');
    }

    await this.prisma.pregnancyJournal.delete({
      where: { id: journalId },
    });

    return { message: 'Journal entry deleted successfully' };
  }

  // ============================================================================
  // MEDICAL INFO MANAGEMENT
  // ============================================================================

  /**
   * Update medical conditions
   */
  async updateMedicalConditions(userId: string, pregnancyId: string, conditions: string[]) {
    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    const updated = await this.prisma.pregnancy.update({
      where: { id: pregnancyId },
      data: { medicalConditions: conditions },
      include: {
        pregnancyCheckups: { orderBy: { checkupDate: 'desc' }, take: 5 },
        pregnancyMeasurements: { orderBy: { measurementDate: 'desc' }, take: 5 },
      },
    });

    return this.formatPregnancy(updated);
  }

  /**
   * Update allergies
   */
  async updateAllergies(userId: string, pregnancyId: string, allergies: string[]) {
    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    const updated = await this.prisma.pregnancy.update({
      where: { id: pregnancyId },
      data: { allergies },
      include: {
        pregnancyCheckups: { orderBy: { checkupDate: 'desc' }, take: 5 },
        pregnancyMeasurements: { orderBy: { measurementDate: 'desc' }, take: 5 },
      },
    });

    return this.formatPregnancy(updated);
  }

  /**
   * Update weight
   */
  async updateWeight(userId: string, pregnancyId: string, weight: number) {
    const pregnancy = await this.prisma.pregnancy.findUnique({
      where: { id: pregnancyId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    if (pregnancy.userId !== userId) {
      throw new ForbiddenException('Access denied to this pregnancy profile');
    }

    const updated = await this.prisma.pregnancy.update({
      where: { id: pregnancyId },
      data: { currentWeight: weight },
      include: {
        pregnancyCheckups: { orderBy: { checkupDate: 'desc' }, take: 5 },
        pregnancyMeasurements: { orderBy: { measurementDate: 'desc' }, take: 5 },
      },
    });

    return this.formatPregnancy(updated);
  }

  /**
   * Format pregnancy for response
   */
  private formatPregnancy(pregnancy: any) {
    // Recalculate current week based on EDD
    const currentWeek = this.calculatePregnancyWeek(pregnancy.expectedDeliveryDate);
    const trimester = this.calculateTrimester(currentWeek);

    return {
      id: pregnancy.id,
      userId: pregnancy.userId,
      motherFirstName: pregnancy.motherFirstName,
      motherLastName: pregnancy.motherLastName,
      motherFullName: `${pregnancy.motherFirstName} ${pregnancy.motherLastName}`,
      motherDateOfBirth: pregnancy.motherDateOfBirth?.toISOString(),
      motherBloodType: this.mapBloodTypeToDisplay(pregnancy.motherBloodType),
      motherPhotoUri: pregnancy.motherPhotoUri,
      expectedDeliveryDate: pregnancy.expectedDeliveryDate?.toISOString(),
      lastMenstrualPeriod: pregnancy.lastMenstrualPeriod?.toISOString(),
      conceptionDate: pregnancy.conceptionDate?.toISOString(),
      status: pregnancy.status,
      currentWeek: pregnancy.status === 'active' ? currentWeek : pregnancy.currentWeek,
      trimester: pregnancy.status === 'active' ? trimester : pregnancy.trimester,
      gravida: pregnancy.gravida,
      para: pregnancy.para,
      bloodPressure: pregnancy.bloodPressure,
      prePregnancyWeight: pregnancy.prePregnancyWeight,
      currentWeight: pregnancy.currentWeight,
      height: pregnancy.height,
      isHighRisk: pregnancy.isHighRisk,
      riskFactors: pregnancy.riskFactors,
      medicalConditions: pregnancy.medicalConditions,
      allergies: pregnancy.allergies,
      medications: pregnancy.medications,
      hospitalName: pregnancy.hospitalName,
      obgynName: pregnancy.obgynName,
      obgynContact: pregnancy.obgynContact,
      midwifeName: pregnancy.midwifeName,
      midwifeContact: pregnancy.midwifeContact,
      expectedGender: pregnancy.expectedGender,
      babyNickname: pregnancy.babyNickname,
      numberOfBabies: pregnancy.numberOfBabies,
      convertedToChildId: pregnancy.convertedToChildId,
      deliveryDate: pregnancy.deliveryDate?.toISOString(),
      deliveryType: pregnancy.deliveryType,
      deliveryNotes: pregnancy.deliveryNotes,
      emergencyContactName: pregnancy.emergencyContactName,
      emergencyContactPhone: pregnancy.emergencyContactPhone,
      emergencyContactRelation: pregnancy.emergencyContactRelation,
      checkups: pregnancy.pregnancyCheckups?.map((c: any) => this.formatCheckup(c)),
      measurements: pregnancy.pregnancyMeasurements?.map((m: any) => this.formatMeasurement(m)),
      createdAt: pregnancy.createdAt?.toISOString(),
      updatedAt: pregnancy.updatedAt?.toISOString(),
    };
  }

  /**
   * Format checkup for response
   */
  private formatCheckup(checkup: any) {
    return {
      id: checkup.id,
      pregnancyId: checkup.pregnancyId,
      checkupDate: checkup.checkupDate?.toISOString(),
      weekOfPregnancy: checkup.weekOfPregnancy,
      weight: checkup.weight,
      bloodPressureSystolic: checkup.bloodPressureSystolic,
      bloodPressureDiastolic: checkup.bloodPressureDiastolic,
      bloodPressure: checkup.bloodPressureSystolic && checkup.bloodPressureDiastolic
        ? `${checkup.bloodPressureSystolic}/${checkup.bloodPressureDiastolic}`
        : null,
      fundalHeight: checkup.fundalHeight,
      fetalHeartRate: checkup.fetalHeartRate,
      fetalWeight: checkup.fetalWeight,
      fetalLength: checkup.fetalLength,
      amnioticFluid: checkup.amnioticFluid,
      placentaPosition: checkup.placentaPosition,
      urineProtein: checkup.urineProtein,
      urineGlucose: checkup.urineGlucose,
      hemoglobin: checkup.hemoglobin,
      notes: checkup.notes,
      recommendations: checkup.recommendations,
      nextCheckupDate: checkup.nextCheckupDate?.toISOString(),
      providerName: checkup.providerName,
      location: checkup.location,
      createdAt: checkup.createdAt?.toISOString(),
      updatedAt: checkup.updatedAt?.toISOString(),
    };
  }

  /**
   * Format measurement for response
   */
  private formatMeasurement(measurement: any) {
    return {
      id: measurement.id,
      pregnancyId: measurement.pregnancyId,
      measurementDate: measurement.measurementDate?.toISOString(),
      weekOfPregnancy: measurement.weekOfPregnancy,
      weight: measurement.weight,
      bellyCircumference: measurement.bellyCircumference,
      bloodPressureSystolic: measurement.bloodPressureSystolic,
      bloodPressureDiastolic: measurement.bloodPressureDiastolic,
      bloodPressure: measurement.bloodPressureSystolic && measurement.bloodPressureDiastolic
        ? `${measurement.bloodPressureSystolic}/${measurement.bloodPressureDiastolic}`
        : null,
      symptoms: measurement.symptoms,
      mood: measurement.mood,
      notes: measurement.notes,
      createdAt: measurement.createdAt?.toISOString(),
      updatedAt: measurement.updatedAt?.toISOString(),
    };
  }

  /**
   * Format symptom for response
   */
  private formatSymptom(symptom: any) {
    return {
      id: symptom.id,
      pregnancyId: symptom.pregnancyId,
      date: symptom.date?.toISOString(),
      weekOfPregnancy: symptom.weekOfPregnancy,
      symptoms: symptom.symptoms,
      notes: symptom.notes,
      createdAt: symptom.createdAt?.toISOString(),
      updatedAt: symptom.updatedAt?.toISOString(),
    };
  }

  /**
   * Format journal for response
   */
  private formatJournal(journal: any) {
    return {
      id: journal.id,
      pregnancyId: journal.pregnancyId,
      date: journal.date?.toISOString(),
      weekOfPregnancy: journal.weekOfPregnancy,
      title: journal.title,
      content: journal.content,
      mood: journal.mood,
      createdAt: journal.createdAt?.toISOString(),
      updatedAt: journal.updatedAt?.toISOString(),
    };
  }

  /**
   * Format child for response (used after conversion)
   */
  private formatChild(child: any) {
    return {
      id: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      fullName: `${child.firstName} ${child.lastName}`,
      dateOfBirth: child.dateOfBirth?.toISOString(),
      gender: child.gender,
      chdrNumber: child.chdrNumber,
      photoUri: child.photoUri,
      birthWeight: child.birthWeight,
      birthHeight: child.birthHeight,
      birthHeadCircumference: child.birthHeadCircumference,
      bloodType: this.mapBloodTypeToDisplay(child.bloodType),
      placeOfBirth: child.placeOfBirth,
      deliveryType: child.deliveryType,
      allergies: child.allergies,
      specialConditions: child.specialConditions,
      motherName: child.motherName,
      fatherName: child.fatherName,
      emergencyContact: child.emergencyContact,
      address: child.address,
      createdAt: child.createdAt?.toISOString(),
      updatedAt: child.updatedAt?.toISOString(),
    };
  }
}
