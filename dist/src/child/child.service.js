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
var ChildService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChildService = ChildService_1 = class ChildService {
    prisma;
    logger = new common_1.Logger(ChildService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapBloodType(bloodType) {
        if (!bloodType)
            return undefined;
        const mapping = {
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
    mapBloodTypeToDisplay(bloodType) {
        if (!bloodType)
            return 'unknown';
        const mapping = {
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
    async create(userId, dto) {
        this.logger.log(`Creating child profile for user: ${userId}`);
        const child = await this.prisma.child.create({
            data: {
                userId,
                firstName: dto.firstName,
                lastName: dto.lastName,
                dateOfBirth: new Date(dto.dateOfBirth),
                gender: dto.gender,
                chdrNumber: dto.chdrNumber,
                photoUri: dto.photoUri,
                birthWeight: dto.birthWeight,
                birthHeight: dto.birthHeight,
                birthHeadCircumference: dto.birthHeadCircumference,
                bloodType: this.mapBloodType(dto.bloodType),
                placeOfBirth: dto.placeOfBirth,
                deliveryType: dto.deliveryType,
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
    async findAll(userId) {
        const children = await this.prisma.child.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return children.map(this.formatChild.bind(this));
    }
    async findOne(userId, childId) {
        const child = await this.prisma.child.findUnique({
            where: { id: childId },
        });
        if (!child) {
            throw new common_1.NotFoundException('Child not found');
        }
        if (child.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.formatChild(child);
    }
    async update(userId, childId, dto) {
        const child = await this.prisma.child.findUnique({
            where: { id: childId },
        });
        if (!child) {
            throw new common_1.NotFoundException('Child not found');
        }
        if (child.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const updateData = {};
        if (dto.firstName !== undefined)
            updateData.firstName = dto.firstName;
        if (dto.lastName !== undefined)
            updateData.lastName = dto.lastName;
        if (dto.dateOfBirth !== undefined)
            updateData.dateOfBirth = new Date(dto.dateOfBirth);
        if (dto.gender !== undefined)
            updateData.gender = dto.gender;
        if (dto.chdrNumber !== undefined)
            updateData.chdrNumber = dto.chdrNumber;
        if (dto.photoUri !== undefined)
            updateData.photoUri = dto.photoUri;
        if (dto.birthWeight !== undefined)
            updateData.birthWeight = dto.birthWeight;
        if (dto.birthHeight !== undefined)
            updateData.birthHeight = dto.birthHeight;
        if (dto.birthHeadCircumference !== undefined)
            updateData.birthHeadCircumference = dto.birthHeadCircumference;
        if (dto.bloodType !== undefined)
            updateData.bloodType = this.mapBloodType(dto.bloodType);
        if (dto.placeOfBirth !== undefined)
            updateData.placeOfBirth = dto.placeOfBirth;
        if (dto.deliveryType !== undefined)
            updateData.deliveryType = dto.deliveryType;
        if (dto.allergies !== undefined)
            updateData.allergies = dto.allergies;
        if (dto.specialConditions !== undefined)
            updateData.specialConditions = dto.specialConditions;
        if (dto.motherName !== undefined)
            updateData.motherName = dto.motherName;
        if (dto.fatherName !== undefined)
            updateData.fatherName = dto.fatherName;
        if (dto.emergencyContact !== undefined)
            updateData.emergencyContact = dto.emergencyContact;
        if (dto.address !== undefined)
            updateData.address = dto.address;
        const updated = await this.prisma.child.update({
            where: { id: childId },
            data: updateData,
        });
        return this.formatChild(updated);
    }
    async remove(userId, childId) {
        const child = await this.prisma.child.findUnique({
            where: { id: childId },
        });
        if (!child) {
            throw new common_1.NotFoundException('Child not found');
        }
        if (child.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        await this.prisma.child.delete({
            where: { id: childId },
        });
        return { message: 'Child profile deleted successfully' };
    }
    formatChild(child) {
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
};
exports.ChildService = ChildService;
exports.ChildService = ChildService = ChildService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChildService);
//# sourceMappingURL=child.service.js.map