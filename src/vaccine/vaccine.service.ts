/**
 * Vaccine Service
 * 
 * Business logic for vaccine schedule and vaccination records.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccinationRecordDto, UpdateVaccinationRecordDto } from './dto';
import { VaccinationStatus } from '@prisma/client';

@Injectable()
export class VaccineService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all vaccines in the schedule
   */
  async getAllVaccines() {
    return this.prisma.vaccine.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { scheduledAgeMonths: 'asc' },
        { doseNumber: 'asc' },
      ],
    });
  }

  /**
   * Get vaccines grouped by age
   */
  async getVaccinesByAgeGroup() {
    const vaccines = await this.getAllVaccines();
    
    const groups: Record<string, typeof vaccines> = {};
    for (const vaccine of vaccines) {
      if (!groups[vaccine.ageGroup]) {
        groups[vaccine.ageGroup] = [];
      }
      groups[vaccine.ageGroup].push(vaccine);
    }

    return Object.entries(groups).map(([ageGroup, vaccines]) => ({
      ageGroup,
      vaccines,
    }));
  }

  /**
   * Get vaccination records for a child
   */
  async getChildVaccinationRecords(userId: string, childId: string) {
    // Verify child belongs to user
    const child = await this.prisma.child.findFirst({
      where: { id: childId, userId },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // Get all vaccines
    const vaccines = await this.getAllVaccines();
    
    // Get existing vaccination records for this child
    const records = await this.prisma.vaccinationRecord.findMany({
      where: { childId },
      include: { vaccine: true },
    });

    // Create a map of existing records
    const recordMap = new Map(records.map(r => [r.vaccineId, r]));

    // Calculate scheduled date based on child's DOB
    const childDob = new Date(child.dateOfBirth);
    const today = new Date();

    // Build complete vaccination schedule with status
    const schedule = vaccines.map(vaccine => {
      const existingRecord = recordMap.get(vaccine.id);
      
      // Calculate scheduled date
      const scheduledDate = new Date(childDob);
      scheduledDate.setMonth(scheduledDate.getMonth() + vaccine.scheduledAgeMonths);
      if (vaccine.scheduledAgeDays) {
        scheduledDate.setDate(scheduledDate.getDate() + vaccine.scheduledAgeDays);
      }

      // Determine status
      let status: VaccinationStatus = 'pending';
      if (existingRecord) {
        status = existingRecord.status;
      } else if (scheduledDate < today) {
        // More than 30 days overdue = overdue, otherwise pending
        const daysDiff = Math.floor((today.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24));
        status = daysDiff > 30 ? 'overdue' : 'pending';
      } else {
        status = 'scheduled';
      }

      return {
        id: existingRecord?.id || null,
        vaccineId: vaccine.id,
        vaccine,
        childId,
        scheduledDate: scheduledDate.toISOString(),
        administeredDate: existingRecord?.administeredDate?.toISOString() || null,
        administeredBy: existingRecord?.administeredBy || null,
        location: existingRecord?.location || null,
        batchNumber: existingRecord?.batchNumber || null,
        notes: existingRecord?.notes || null,
        sideEffectsOccurred: existingRecord?.sideEffectsOccurred || [],
        status,
      };
    });

    // Calculate statistics
    const completed = schedule.filter(s => s.status === 'completed').length;
    const total = schedule.length;
    const overdue = schedule.filter(s => s.status === 'overdue').length;
    const pending = schedule.filter(s => s.status === 'pending').length;
    const nextVaccine = schedule.find(s => s.status === 'pending' || s.status === 'scheduled' || s.status === 'overdue');

    return {
      child: {
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        dateOfBirth: child.dateOfBirth,
      },
      schedule,
      statistics: {
        completed,
        total,
        overdue,
        pending,
        completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      nextVaccine,
    };
  }

  /**
   * Mark a vaccine as administered
   */
  async administerVaccine(
    userId: string,
    childId: string,
    vaccineId: string,
    dto: UpdateVaccinationRecordDto,
  ) {
    // Verify child belongs to user
    const child = await this.prisma.child.findFirst({
      where: { id: childId, userId },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // Calculate scheduled date
    const vaccine = await this.prisma.vaccine.findUnique({
      where: { id: vaccineId },
    });

    if (!vaccine) {
      throw new NotFoundException('Vaccine not found');
    }

    const childDob = new Date(child.dateOfBirth);
    const scheduledDate = new Date(childDob);
    scheduledDate.setMonth(scheduledDate.getMonth() + vaccine.scheduledAgeMonths);
    if (vaccine.scheduledAgeDays) {
      scheduledDate.setDate(scheduledDate.getDate() + vaccine.scheduledAgeDays);
    }

    // Upsert the vaccination record
    const record = await this.prisma.vaccinationRecord.upsert({
      where: {
        childId_vaccineId: { childId, vaccineId },
      },
      create: {
        childId,
        vaccineId,
        scheduledDate,
        status: 'completed',
        administeredDate: dto.administeredDate ? new Date(dto.administeredDate) : new Date(),
        administeredBy: dto.administeredBy,
        location: dto.location,
        batchNumber: dto.batchNumber,
        notes: dto.notes,
        sideEffectsOccurred: dto.sideEffectsOccurred || [],
      },
      update: {
        status: dto.status || 'completed',
        administeredDate: dto.administeredDate ? new Date(dto.administeredDate) : new Date(),
        administeredBy: dto.administeredBy,
        location: dto.location,
        batchNumber: dto.batchNumber,
        notes: dto.notes,
        sideEffectsOccurred: dto.sideEffectsOccurred || [],
      },
      include: { vaccine: true },
    });

    // Automatically create an activity for this vaccination
    await this.prisma.activity.create({
      data: {
        childId,
        type: 'vaccination',
        title: `Vaccination: ${record.vaccine.shortName}`,
        description: `Administered ${record.vaccine.name}${dto.location ? ` at ${dto.location}` : ''}${dto.notes ? ` | Notes: ${dto.notes}` : ''}`,
        date: record.administeredDate || new Date(),
        icon: 'vaccination',
      },
    });

    return record;
  }

  /**
   * Update a vaccination record
   */
  async updateVaccinationRecord(
    userId: string,
    recordId: string,
    dto: UpdateVaccinationRecordDto,
  ) {
    // Find the record and verify ownership
    const record = await this.prisma.vaccinationRecord.findUnique({
      where: { id: recordId },
      include: { child: true },
    });

    if (!record) {
      throw new NotFoundException('Vaccination record not found');
    }

    if (record.child.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.vaccinationRecord.update({
      where: { id: recordId },
      data: {
        status: dto.status,
        scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
        administeredDate: dto.administeredDate ? new Date(dto.administeredDate) : undefined,
        administeredBy: dto.administeredBy,
        location: dto.location,
        batchNumber: dto.batchNumber,
        notes: dto.notes,
        sideEffectsOccurred: dto.sideEffectsOccurred,
      },
      include: { vaccine: true },
    });
  }

  /**
   * Seed Sri Lanka vaccination schedule
   */
  async seedVaccineSchedule() {
    const vaccines = [
      // At Birth
      {
        name: 'Bacillus Calmette-Guérin',
        shortName: 'BCG',
        description: 'Vaccine against tuberculosis',
        scheduledAgeMonths: 0,
        scheduledAgeDays: 0,
        doseNumber: 1,
        totalDoses: 1,
        ageGroup: 'At Birth',
        diseasesPrevented: ['Tuberculosis'],
        sideEffects: ['Local swelling', 'Mild fever'],
        contraindications: ['Immunodeficiency', 'HIV positive with symptoms'],
        sortOrder: 1,
      },
      {
        name: 'Oral Polio Vaccine (Birth Dose)',
        shortName: 'OPV',
        description: 'Oral vaccine against poliomyelitis - Birth dose',
        scheduledAgeMonths: 0,
        scheduledAgeDays: 0,
        doseNumber: 0,
        totalDoses: 5,
        ageGroup: 'At Birth',
        diseasesPrevented: ['Poliomyelitis'],
        sideEffects: ['Rare mild fever'],
        contraindications: ['Severe immunodeficiency'],
        sortOrder: 2,
      },
      // 2 Months
      {
        name: 'Pentavalent Vaccine (DPT-HepB-Hib)',
        shortName: 'Pentavalent',
        description: 'Combined vaccine against Diphtheria, Pertussis, Tetanus, Hepatitis B, and Haemophilus influenzae type b',
        scheduledAgeMonths: 2,
        scheduledAgeDays: 0,
        doseNumber: 1,
        totalDoses: 3,
        ageGroup: '2 Months',
        diseasesPrevented: ['Diphtheria', 'Pertussis', 'Tetanus', 'Hepatitis B', 'Haemophilus influenzae type b'],
        sideEffects: ['Fever', 'Injection site pain', 'Irritability'],
        contraindications: ['Severe allergic reaction to previous dose'],
        sortOrder: 3,
      },
      {
        name: 'Oral Polio Vaccine',
        shortName: 'OPV',
        description: 'Oral vaccine against poliomyelitis - First dose',
        scheduledAgeMonths: 2,
        scheduledAgeDays: 0,
        doseNumber: 1,
        totalDoses: 5,
        ageGroup: '2 Months',
        diseasesPrevented: ['Poliomyelitis'],
        sideEffects: ['Rare mild fever'],
        contraindications: ['Severe immunodeficiency'],
        sortOrder: 4,
      },
      {
        name: 'Fractional Inactivated Polio Vaccine',
        shortName: 'fIPV',
        description: 'Injectable inactivated polio vaccine - First dose',
        scheduledAgeMonths: 2,
        scheduledAgeDays: 0,
        doseNumber: 1,
        totalDoses: 2,
        ageGroup: '2 Months',
        diseasesPrevented: ['Poliomyelitis'],
        sideEffects: ['Injection site reactions'],
        contraindications: ['Severe allergic reaction to previous dose'],
        sortOrder: 5,
      },
      // 4 Months
      {
        name: 'Pentavalent Vaccine (DPT-HepB-Hib)',
        shortName: 'Pentavalent',
        description: 'Combined vaccine - Second dose',
        scheduledAgeMonths: 4,
        scheduledAgeDays: 0,
        doseNumber: 2,
        totalDoses: 3,
        ageGroup: '4 Months',
        diseasesPrevented: ['Diphtheria', 'Pertussis', 'Tetanus', 'Hepatitis B', 'Haemophilus influenzae type b'],
        sideEffects: ['Fever', 'Injection site pain', 'Irritability'],
        contraindications: ['Severe allergic reaction to previous dose'],
        sortOrder: 6,
      },
      {
        name: 'Oral Polio Vaccine',
        shortName: 'OPV',
        description: 'Oral vaccine against poliomyelitis - Second dose',
        scheduledAgeMonths: 4,
        scheduledAgeDays: 0,
        doseNumber: 2,
        totalDoses: 5,
        ageGroup: '4 Months',
        diseasesPrevented: ['Poliomyelitis'],
        sideEffects: ['Rare mild fever'],
        contraindications: ['Severe immunodeficiency'],
        sortOrder: 7,
      },
      {
        name: 'Fractional Inactivated Polio Vaccine',
        shortName: 'fIPV',
        description: 'Injectable inactivated polio vaccine - Second dose',
        scheduledAgeMonths: 4,
        scheduledAgeDays: 0,
        doseNumber: 2,
        totalDoses: 2,
        ageGroup: '4 Months',
        diseasesPrevented: ['Poliomyelitis'],
        sideEffects: ['Injection site reactions'],
        contraindications: ['Severe allergic reaction to previous dose'],
        sortOrder: 8,
      },
      // 6 Months
      {
        name: 'Pentavalent Vaccine (DPT-HepB-Hib)',
        shortName: 'Pentavalent',
        description: 'Combined vaccine - Third dose',
        scheduledAgeMonths: 6,
        scheduledAgeDays: 0,
        doseNumber: 3,
        totalDoses: 3,
        ageGroup: '6 Months',
        diseasesPrevented: ['Diphtheria', 'Pertussis', 'Tetanus', 'Hepatitis B', 'Haemophilus influenzae type b'],
        sideEffects: ['Fever', 'Injection site pain', 'Irritability'],
        contraindications: ['Severe allergic reaction to previous dose'],
        sortOrder: 9,
      },
      {
        name: 'Oral Polio Vaccine',
        shortName: 'OPV',
        description: 'Oral vaccine against poliomyelitis - Third dose',
        scheduledAgeMonths: 6,
        scheduledAgeDays: 0,
        doseNumber: 3,
        totalDoses: 5,
        ageGroup: '6 Months',
        diseasesPrevented: ['Poliomyelitis'],
        sideEffects: ['Rare mild fever'],
        contraindications: ['Severe immunodeficiency'],
        sortOrder: 10,
      },
      // 9 Months
      {
        name: 'Measles, Mumps, Rubella Vaccine',
        shortName: 'MMR',
        description: 'Combined vaccine against Measles, Mumps, and Rubella - First dose',
        scheduledAgeMonths: 9,
        scheduledAgeDays: 0,
        doseNumber: 1,
        totalDoses: 2,
        ageGroup: '9 Months',
        diseasesPrevented: ['Measles', 'Mumps', 'Rubella'],
        sideEffects: ['Mild fever', 'Rash', 'Joint pain'],
        contraindications: ['Pregnancy', 'Severe immunodeficiency', 'Allergy to vaccine components'],
        sortOrder: 11,
      },
      // 12 Months
      {
        name: 'Japanese Encephalitis Vaccine (Live)',
        shortName: 'Live JE',
        description: 'Live attenuated vaccine against Japanese Encephalitis',
        scheduledAgeMonths: 12,
        scheduledAgeDays: 0,
        doseNumber: 1,
        totalDoses: 1,
        ageGroup: '12 Months',
        diseasesPrevented: ['Japanese Encephalitis'],
        sideEffects: ['Mild fever', 'Injection site reactions'],
        contraindications: ['Severe immunodeficiency', 'Pregnancy'],
        sortOrder: 12,
      },
      // 18 Months
      {
        name: 'DPT Booster',
        shortName: 'DPT',
        description: 'Diphtheria, Pertussis, Tetanus booster dose',
        scheduledAgeMonths: 18,
        scheduledAgeDays: 0,
        doseNumber: 4,
        totalDoses: 4,
        ageGroup: '18 Months',
        diseasesPrevented: ['Diphtheria', 'Pertussis', 'Tetanus'],
        sideEffects: ['Fever', 'Injection site pain', 'Irritability'],
        contraindications: ['Severe allergic reaction to previous dose'],
        sortOrder: 13,
      },
      {
        name: 'Oral Polio Vaccine (Booster)',
        shortName: 'OPV',
        description: 'Oral vaccine against poliomyelitis - Booster dose',
        scheduledAgeMonths: 18,
        scheduledAgeDays: 0,
        doseNumber: 4,
        totalDoses: 5,
        ageGroup: '18 Months',
        diseasesPrevented: ['Poliomyelitis'],
        sideEffects: ['Rare mild fever'],
        contraindications: ['Severe immunodeficiency'],
        sortOrder: 14,
      },
      // 3 Years
      {
        name: 'Measles, Mumps, Rubella Vaccine',
        shortName: 'MMR',
        description: 'Combined vaccine - Second dose',
        scheduledAgeMonths: 36,
        scheduledAgeDays: 0,
        doseNumber: 2,
        totalDoses: 2,
        ageGroup: '3 Years',
        diseasesPrevented: ['Measles', 'Mumps', 'Rubella'],
        sideEffects: ['Mild fever', 'Rash', 'Joint pain'],
        contraindications: ['Pregnancy', 'Severe immunodeficiency', 'Allergy to vaccine components'],
        sortOrder: 15,
      },
      // 5 Years
      {
        name: 'Diphtheria-Tetanus Vaccine',
        shortName: 'DT',
        description: 'Diphtheria and Tetanus vaccine for school entry',
        scheduledAgeMonths: 60,
        scheduledAgeDays: 0,
        doseNumber: 1,
        totalDoses: 1,
        ageGroup: '5 Years',
        diseasesPrevented: ['Diphtheria', 'Tetanus'],
        sideEffects: ['Injection site pain', 'Mild fever'],
        contraindications: ['Severe allergic reaction to previous dose'],
        sortOrder: 16,
      },
      {
        name: 'Oral Polio Vaccine (School Entry)',
        shortName: 'OPV',
        description: 'Oral vaccine against poliomyelitis - School entry booster',
        scheduledAgeMonths: 60,
        scheduledAgeDays: 0,
        doseNumber: 5,
        totalDoses: 5,
        ageGroup: '5 Years',
        diseasesPrevented: ['Poliomyelitis'],
        sideEffects: ['Rare mild fever'],
        contraindications: ['Severe immunodeficiency'],
        sortOrder: 17,
      },
      // 11 Years
      {
        name: 'Adult Tetanus-Diphtheria Vaccine',
        shortName: 'aTd',
        description: 'Tetanus-Diphtheria booster for adolescents',
        scheduledAgeMonths: 132,
        scheduledAgeDays: 0,
        doseNumber: 1,
        totalDoses: 1,
        ageGroup: '11 Years',
        diseasesPrevented: ['Tetanus', 'Diphtheria'],
        sideEffects: ['Injection site pain', 'Mild fever'],
        contraindications: ['Severe allergic reaction to previous dose'],
        sortOrder: 18,
      },
    ];

    // Use upsert to avoid duplicates
    for (const vaccine of vaccines) {
      await this.prisma.vaccine.upsert({
        where: {
          shortName_doseNumber: {
            shortName: vaccine.shortName,
            doseNumber: vaccine.doseNumber,
          },
        },
        create: vaccine,
        update: vaccine,
      });
    }

    return { message: 'Vaccine schedule seeded successfully', count: vaccines.length };
  }
}
