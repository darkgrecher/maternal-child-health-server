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
var PregnancyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PregnancyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PregnancyService = PregnancyService_1 = class PregnancyService {
    prisma;
    logger = new common_1.Logger(PregnancyService_1.name);
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
    calculatePregnancyWeek(expectedDeliveryDate) {
        const today = new Date();
        const edd = new Date(expectedDeliveryDate);
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        const weeksUntilEDD = Math.floor((edd.getTime() - today.getTime()) / msPerWeek);
        const currentWeek = 40 - weeksUntilEDD;
        return Math.max(1, Math.min(42, currentWeek));
    }
    calculateTrimester(week) {
        if (week <= 12)
            return 1;
        if (week <= 27)
            return 2;
        return 3;
    }
    async create(userId, dto) {
        this.logger.log(`Creating pregnancy profile for user: ${userId}`);
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
                expectedGender: dto.expectedGender,
                babyNickname: dto.babyNickname,
                numberOfBabies: dto.numberOfBabies || 1,
                emergencyContactName: dto.emergencyContactName,
                emergencyContactPhone: dto.emergencyContactPhone,
                emergencyContactRelation: dto.emergencyContactRelation,
            },
        });
        return this.formatPregnancy(pregnancy);
    }
    async findAll(userId) {
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
    async findActive(userId) {
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
    async findOne(userId, pregnancyId) {
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
            throw new common_1.NotFoundException('Pregnancy profile not found');
        }
        if (pregnancy.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied to this pregnancy profile');
        }
        return this.formatPregnancy(pregnancy);
    }
    async update(userId, pregnancyId, dto) {
        const pregnancy = await this.prisma.pregnancy.findUnique({
            where: { id: pregnancyId },
        });
        if (!pregnancy) {
            throw new common_1.NotFoundException('Pregnancy profile not found');
        }
        if (pregnancy.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied to this pregnancy profile');
        }
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
                ...(dto.expectedGender && { expectedGender: dto.expectedGender }),
                ...(dto.babyNickname !== undefined && { babyNickname: dto.babyNickname }),
                ...(dto.numberOfBabies !== undefined && { numberOfBabies: dto.numberOfBabies }),
                ...(dto.emergencyContactName !== undefined && { emergencyContactName: dto.emergencyContactName }),
                ...(dto.emergencyContactPhone !== undefined && { emergencyContactPhone: dto.emergencyContactPhone }),
                ...(dto.emergencyContactRelation !== undefined && { emergencyContactRelation: dto.emergencyContactRelation }),
                ...(dto.deliveryDate && { deliveryDate: new Date(dto.deliveryDate) }),
                ...(dto.deliveryType && { deliveryType: dto.deliveryType }),
                ...(dto.deliveryNotes !== undefined && { deliveryNotes: dto.deliveryNotes }),
            },
        });
        return this.formatPregnancy(updated);
    }
    async delete(userId, pregnancyId) {
        const pregnancy = await this.prisma.pregnancy.findUnique({
            where: { id: pregnancyId },
        });
        if (!pregnancy) {
            throw new common_1.NotFoundException('Pregnancy profile not found');
        }
        if (pregnancy.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied to this pregnancy profile');
        }
        await this.prisma.pregnancy.delete({
            where: { id: pregnancyId },
        });
        return { message: 'Pregnancy profile deleted successfully' };
    }
    async convertToChild(userId, pregnancyId, dto) {
        this.logger.log(`Converting pregnancy ${pregnancyId} to child profile`);
        const pregnancy = await this.prisma.pregnancy.findUnique({
            where: { id: pregnancyId },
        });
        if (!pregnancy) {
            throw new common_1.NotFoundException('Pregnancy profile not found');
        }
        if (pregnancy.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied to this pregnancy profile');
        }
        if (pregnancy.status === 'converted') {
            throw new common_1.BadRequestException('This pregnancy has already been converted to a child profile');
        }
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
                placeOfBirth: dto.placeOfBirth || pregnancy.hospitalName,
                deliveryType: dto.deliveryType,
                allergies: dto.allergies || [],
                specialConditions: dto.specialConditions || [],
                motherName: `${pregnancy.motherFirstName} ${pregnancy.motherLastName}`,
                emergencyContact: pregnancy.emergencyContactPhone,
                address: dto.address,
            },
        });
        await this.prisma.pregnancy.update({
            where: { id: pregnancyId },
            data: {
                status: 'converted',
                convertedToChildId: child.id,
                deliveryDate: new Date(dto.dateOfBirth),
                deliveryType: dto.deliveryType,
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
    async addCheckup(userId, pregnancyId, dto) {
        const pregnancy = await this.prisma.pregnancy.findUnique({
            where: { id: pregnancyId },
        });
        if (!pregnancy) {
            throw new common_1.NotFoundException('Pregnancy profile not found');
        }
        if (pregnancy.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied to this pregnancy profile');
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
        if (dto.weight) {
            await this.prisma.pregnancy.update({
                where: { id: pregnancyId },
                data: { currentWeight: dto.weight },
            });
        }
        return this.formatCheckup(checkup);
    }
    async getCheckups(userId, pregnancyId) {
        const pregnancy = await this.prisma.pregnancy.findUnique({
            where: { id: pregnancyId },
        });
        if (!pregnancy) {
            throw new common_1.NotFoundException('Pregnancy profile not found');
        }
        if (pregnancy.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied to this pregnancy profile');
        }
        const checkups = await this.prisma.pregnancyCheckup.findMany({
            where: { pregnancyId },
            orderBy: { checkupDate: 'desc' },
        });
        return checkups.map(c => this.formatCheckup(c));
    }
    async addMeasurement(userId, pregnancyId, dto) {
        const pregnancy = await this.prisma.pregnancy.findUnique({
            where: { id: pregnancyId },
        });
        if (!pregnancy) {
            throw new common_1.NotFoundException('Pregnancy profile not found');
        }
        if (pregnancy.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied to this pregnancy profile');
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
        await this.prisma.pregnancy.update({
            where: { id: pregnancyId },
            data: { currentWeight: dto.weight },
        });
        return this.formatMeasurement(measurement);
    }
    async getMeasurements(userId, pregnancyId) {
        const pregnancy = await this.prisma.pregnancy.findUnique({
            where: { id: pregnancyId },
        });
        if (!pregnancy) {
            throw new common_1.NotFoundException('Pregnancy profile not found');
        }
        if (pregnancy.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied to this pregnancy profile');
        }
        const measurements = await this.prisma.pregnancyMeasurement.findMany({
            where: { pregnancyId },
            orderBy: { measurementDate: 'desc' },
        });
        return measurements.map(m => this.formatMeasurement(m));
    }
    formatPregnancy(pregnancy) {
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
            checkups: pregnancy.pregnancyCheckups?.map((c) => this.formatCheckup(c)),
            measurements: pregnancy.pregnancyMeasurements?.map((m) => this.formatMeasurement(m)),
            createdAt: pregnancy.createdAt?.toISOString(),
            updatedAt: pregnancy.updatedAt?.toISOString(),
        };
    }
    formatCheckup(checkup) {
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
    formatMeasurement(measurement) {
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
    formatChild(child) {
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
};
exports.PregnancyService = PregnancyService;
exports.PregnancyService = PregnancyService = PregnancyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PregnancyService);
//# sourceMappingURL=pregnancy.service.js.map