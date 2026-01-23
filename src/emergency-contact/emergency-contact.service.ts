import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmergencyContactDto, UpdateEmergencyContactDto } from './dto';

// Default emergency contact for Sri Lanka
const DEFAULT_EMERGENCY_CONTACT = {
  name: 'Emergency Services',
  role: 'Ambulance',
  phone: '1990',
  isPrimary: false,
  isDefault: true,
};

@Injectable()
export class EmergencyContactService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all emergency contacts for a user (including default ones)
   */
  async getUserContacts(userId: string) {
    const contacts = await this.prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: [
        { isPrimary: 'desc' },
        { isDefault: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    // If no default contact exists, create one
    const hasDefault = contacts.some(c => c.isDefault);
    if (!hasDefault) {
      const defaultContact = await this.prisma.emergencyContact.create({
        data: {
          userId,
          ...DEFAULT_EMERGENCY_CONTACT,
        },
      });
      contacts.push(defaultContact);
    }

    return contacts;
  }

  /**
   * Get a single emergency contact
   */
  async getContact(userId: string, contactId: string) {
    const contact = await this.prisma.emergencyContact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new NotFoundException('Emergency contact not found');
    }

    if (contact.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return contact;
  }

  /**
   * Create a new emergency contact
   */
  async createContact(userId: string, dto: CreateEmergencyContactDto) {
    // If this is marked as primary, unset other primary contacts
    if (dto.isPrimary) {
      await this.prisma.emergencyContact.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const contact = await this.prisma.emergencyContact.create({
      data: {
        userId,
        name: dto.name,
        role: dto.role,
        phone: dto.phone,
        isPrimary: dto.isPrimary || false,
        isDefault: false,
        email: dto.email,
        address: dto.address,
        notes: dto.notes,
      },
    });

    return contact;
  }

  /**
   * Update an emergency contact
   */
  async updateContact(userId: string, contactId: string, dto: UpdateEmergencyContactDto) {
    const contact = await this.getContact(userId, contactId);

    // Cannot edit default contacts
    if (contact.isDefault) {
      throw new ForbiddenException('Cannot edit default emergency contacts');
    }

    // If this is marked as primary, unset other primary contacts
    if (dto.isPrimary) {
      await this.prisma.emergencyContact.updateMany({
        where: { userId, isPrimary: true, id: { not: contactId } },
        data: { isPrimary: false },
      });
    }

    return this.prisma.emergencyContact.update({
      where: { id: contactId },
      data: dto,
    });
  }

  /**
   * Delete an emergency contact
   */
  async deleteContact(userId: string, contactId: string) {
    const contact = await this.getContact(userId, contactId);

    // Cannot delete default contacts
    if (contact.isDefault) {
      throw new ForbiddenException('Cannot delete default emergency contacts');
    }

    await this.prisma.emergencyContact.delete({
      where: { id: contactId },
    });

    return { message: 'Emergency contact deleted successfully' };
  }

  /**
   * Set a contact as primary
   */
  async setPrimaryContact(userId: string, contactId: string) {
    await this.getContact(userId, contactId);

    // Unset other primary contacts
    await this.prisma.emergencyContact.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });

    // Set this contact as primary
    return this.prisma.emergencyContact.update({
      where: { id: contactId },
      data: { isPrimary: true },
    });
  }
}
