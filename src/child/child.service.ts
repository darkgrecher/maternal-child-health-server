/**
 * Child Service
 * 
 * Service for managing child profiles.
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChildDto, UpdateChildDto, BloodType } from './dto';
import { Gender as PrismaGender, BloodType as PrismaBloodType, DeliveryType as PrismaDeliveryType } from '@prisma/client';

@Injectable()
export class ChildService {
  private readonly logger = new Logger(ChildService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Map DTO blood type to Prisma enum
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
   * Create a new child profile
   */
  async create(userId: string, dto: CreateChildDto) {
    this.logger.log(`Creating child profile for user: ${userId}`);

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
        placeOfBirth: dto.placeOfBirth,
        deliveryType: dto.deliveryType as PrismaDeliveryType | undefined,
        allergies: dto.allergies || [],
        specialConditions: dto.specialConditions || [],
        motherName: dto.motherName,
        fatherName: dto.fatherName,
        emergencyContact: dto.emergencyContact,
        address: dto.address,
      },
    });

    return this.formatChild(child);
  }

  /**
   * Get all children for a user
   */
  async findAll(userId: string) {
    const children = await this.prisma.child.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return children.map(this.formatChild.bind(this));
  }

  /**
   * Get a single child by ID
   */
  async findOne(userId: string, childId: string) {
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    if (child.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.formatChild(child);
  }

  /**
   * Update a child profile
   */
  async update(userId: string, childId: string, dto: UpdateChildDto) {
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    if (child.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: any = {};

    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.gender !== undefined) updateData.gender = dto.gender as PrismaGender;
    if (dto.chdrNumber !== undefined) updateData.chdrNumber = dto.chdrNumber;
    if (dto.photoUri !== undefined) updateData.photoUri = dto.photoUri;
    if (dto.birthWeight !== undefined) updateData.birthWeight = dto.birthWeight;
    if (dto.birthHeight !== undefined) updateData.birthHeight = dto.birthHeight;
    if (dto.birthHeadCircumference !== undefined) updateData.birthHeadCircumference = dto.birthHeadCircumference;
    if (dto.bloodType !== undefined) updateData.bloodType = this.mapBloodType(dto.bloodType);
    if (dto.placeOfBirth !== undefined) updateData.placeOfBirth = dto.placeOfBirth;
    if (dto.deliveryType !== undefined) updateData.deliveryType = dto.deliveryType as PrismaDeliveryType;
    if (dto.allergies !== undefined) updateData.allergies = dto.allergies;
    if (dto.specialConditions !== undefined) updateData.specialConditions = dto.specialConditions;
    if (dto.motherName !== undefined) updateData.motherName = dto.motherName;
    if (dto.fatherName !== undefined) updateData.fatherName = dto.fatherName;
    if (dto.emergencyContact !== undefined) updateData.emergencyContact = dto.emergencyContact;
    if (dto.address !== undefined) updateData.address = dto.address;

    const updated = await this.prisma.child.update({
      where: { id: childId },
      data: updateData,
    });

    return this.formatChild(updated);
  }

  /**
   * Delete a child profile
   */
  async remove(userId: string, childId: string) {
    const child = await this.prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    if (child.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.child.delete({
      where: { id: childId },
    });

    return { message: 'Child profile deleted successfully' };
  }

  /**
   * Format child for API response
   */
  private formatChild(child: any) {
    return {
      id: child.id,
      chdrNumber: child.chdrNumber,
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: child.dateOfBirth.toISOString(),
      gender: child.gender,
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
      createdAt: child.createdAt.toISOString(),
      updatedAt: child.updatedAt.toISOString(),
    };
  }
}
