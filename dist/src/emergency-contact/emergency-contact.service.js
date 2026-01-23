"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmergencyContactService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const DEFAULT_EMERGENCY_CONTACT = {
    name: 'Emergency Services',
    role: 'Ambulance',
    phone: '1990',
    isPrimary: false,
    isDefault: true,
};
let EmergencyContactService = class EmergencyContactService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserContacts(userId) {
        const contacts = await this.prisma.emergencyContact.findMany({
            where: { userId },
            orderBy: [
                { isPrimary: 'desc' },
                { isDefault: 'desc' },
                { createdAt: 'asc' },
            ],
        });
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
    async getContact(userId, contactId) {
        const contact = await this.prisma.emergencyContact.findUnique({
            where: { id: contactId },
        });
        if (!contact) {
            throw new common_1.NotFoundException('Emergency contact not found');
        }
        if (contact.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return contact;
    }
    async createContact(userId, dto) {
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
    async updateContact(userId, contactId, dto) {
        const contact = await this.getContact(userId, contactId);
        if (contact.isDefault) {
            throw new common_1.ForbiddenException('Cannot edit default emergency contacts');
        }
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
    async deleteContact(userId, contactId) {
        const contact = await this.getContact(userId, contactId);
        if (contact.isDefault) {
            throw new common_1.ForbiddenException('Cannot delete default emergency contacts');
        }
        await this.prisma.emergencyContact.delete({
            where: { id: contactId },
        });
        return { message: 'Emergency contact deleted successfully' };
    }
    async setPrimaryContact(userId, contactId) {
        await this.getContact(userId, contactId);
        await this.prisma.emergencyContact.updateMany({
            where: { userId, isPrimary: true },
            data: { isPrimary: false },
        });
        return this.prisma.emergencyContact.update({
            where: { id: contactId },
            data: { isPrimary: true },
        });
    }
};
exports.EmergencyContactService = EmergencyContactService;
exports.EmergencyContactService = EmergencyContactService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmergencyContactService);
//# sourceMappingURL=emergency-contact.service.js.map