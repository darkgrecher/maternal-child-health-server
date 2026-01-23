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
exports.GrowthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const WHO_WEIGHT_FOR_AGE_BOYS = {
    0: { median: 3.3, sd: 0.5 },
    1: { median: 4.5, sd: 0.6 },
    2: { median: 5.6, sd: 0.7 },
    3: { median: 6.4, sd: 0.8 },
    4: { median: 7.0, sd: 0.8 },
    5: { median: 7.5, sd: 0.9 },
    6: { median: 7.9, sd: 0.9 },
    7: { median: 8.3, sd: 0.9 },
    8: { median: 8.6, sd: 1.0 },
    9: { median: 8.9, sd: 1.0 },
    10: { median: 9.2, sd: 1.0 },
    11: { median: 9.4, sd: 1.0 },
    12: { median: 9.6, sd: 1.1 },
    18: { median: 10.9, sd: 1.2 },
    24: { median: 12.2, sd: 1.4 },
    36: { median: 14.3, sd: 1.7 },
    48: { median: 16.3, sd: 2.0 },
    60: { median: 18.3, sd: 2.4 },
};
const WHO_WEIGHT_FOR_AGE_GIRLS = {
    0: { median: 3.2, sd: 0.4 },
    1: { median: 4.2, sd: 0.5 },
    2: { median: 5.1, sd: 0.6 },
    3: { median: 5.8, sd: 0.7 },
    4: { median: 6.4, sd: 0.7 },
    5: { median: 6.9, sd: 0.8 },
    6: { median: 7.3, sd: 0.8 },
    7: { median: 7.6, sd: 0.9 },
    8: { median: 7.9, sd: 0.9 },
    9: { median: 8.2, sd: 0.9 },
    10: { median: 8.5, sd: 1.0 },
    11: { median: 8.7, sd: 1.0 },
    12: { median: 8.9, sd: 1.0 },
    18: { median: 10.2, sd: 1.2 },
    24: { median: 11.5, sd: 1.4 },
    36: { median: 13.9, sd: 1.7 },
    48: { median: 16.1, sd: 2.1 },
    60: { median: 18.2, sd: 2.5 },
};
const WHO_HEIGHT_FOR_AGE_BOYS = {
    0: { median: 49.9, sd: 2.0 },
    1: { median: 54.7, sd: 2.1 },
    2: { median: 58.4, sd: 2.2 },
    3: { median: 61.4, sd: 2.3 },
    4: { median: 63.9, sd: 2.4 },
    5: { median: 65.9, sd: 2.4 },
    6: { median: 67.6, sd: 2.5 },
    7: { median: 69.2, sd: 2.5 },
    8: { median: 70.6, sd: 2.6 },
    9: { median: 72.0, sd: 2.6 },
    10: { median: 73.3, sd: 2.7 },
    11: { median: 74.5, sd: 2.7 },
    12: { median: 75.7, sd: 2.8 },
    18: { median: 82.3, sd: 3.1 },
    24: { median: 87.8, sd: 3.4 },
    36: { median: 96.1, sd: 3.9 },
    48: { median: 103.3, sd: 4.3 },
    60: { median: 110.0, sd: 4.7 },
};
const WHO_HEIGHT_FOR_AGE_GIRLS = {
    0: { median: 49.1, sd: 1.9 },
    1: { median: 53.7, sd: 2.0 },
    2: { median: 57.1, sd: 2.2 },
    3: { median: 59.8, sd: 2.3 },
    4: { median: 62.1, sd: 2.4 },
    5: { median: 64.0, sd: 2.4 },
    6: { median: 65.7, sd: 2.5 },
    7: { median: 67.3, sd: 2.5 },
    8: { median: 68.7, sd: 2.6 },
    9: { median: 70.1, sd: 2.6 },
    10: { median: 71.5, sd: 2.7 },
    11: { median: 72.8, sd: 2.7 },
    12: { median: 74.0, sd: 2.8 },
    18: { median: 80.7, sd: 3.1 },
    24: { median: 86.4, sd: 3.5 },
    36: { median: 95.1, sd: 4.0 },
    48: { median: 102.7, sd: 4.5 },
    60: { median: 109.4, sd: 4.9 },
};
const WHO_HEAD_CIRCUMFERENCE_BOYS = {
    0: { median: 34.5, sd: 1.2 },
    1: { median: 37.3, sd: 1.2 },
    2: { median: 39.1, sd: 1.3 },
    3: { median: 40.5, sd: 1.3 },
    4: { median: 41.6, sd: 1.3 },
    5: { median: 42.6, sd: 1.3 },
    6: { median: 43.3, sd: 1.3 },
    7: { median: 44.0, sd: 1.4 },
    8: { median: 44.5, sd: 1.4 },
    9: { median: 45.0, sd: 1.4 },
    10: { median: 45.4, sd: 1.4 },
    11: { median: 45.8, sd: 1.4 },
    12: { median: 46.1, sd: 1.4 },
    18: { median: 47.4, sd: 1.4 },
    24: { median: 48.3, sd: 1.5 },
    36: { median: 49.5, sd: 1.5 },
};
const WHO_HEAD_CIRCUMFERENCE_GIRLS = {
    0: { median: 33.9, sd: 1.2 },
    1: { median: 36.5, sd: 1.2 },
    2: { median: 38.3, sd: 1.2 },
    3: { median: 39.5, sd: 1.3 },
    4: { median: 40.6, sd: 1.3 },
    5: { median: 41.5, sd: 1.3 },
    6: { median: 42.2, sd: 1.3 },
    7: { median: 42.8, sd: 1.3 },
    8: { median: 43.4, sd: 1.3 },
    9: { median: 43.8, sd: 1.4 },
    10: { median: 44.2, sd: 1.4 },
    11: { median: 44.6, sd: 1.4 },
    12: { median: 44.9, sd: 1.4 },
    18: { median: 46.2, sd: 1.4 },
    24: { median: 47.2, sd: 1.4 },
    36: { median: 48.5, sd: 1.5 },
};
let GrowthService = class GrowthService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    calculateAgeInMonths(dateOfBirth, measurementDate) {
        const months = (measurementDate.getFullYear() - dateOfBirth.getFullYear()) * 12 +
            (measurementDate.getMonth() - dateOfBirth.getMonth());
        return Math.max(0, months);
    }
    calculateAgeInDays(dateOfBirth, measurementDate) {
        const diffTime = measurementDate.getTime() - dateOfBirth.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    getClosestReferenceAge(ageInMonths, referenceData) {
        const ages = Object.keys(referenceData).map(Number).sort((a, b) => a - b);
        let closest = ages[0];
        for (const age of ages) {
            if (age <= ageInMonths) {
                closest = age;
            }
            else {
                break;
            }
        }
        return closest;
    }
    calculateZScore(value, median, sd) {
        return (value - median) / sd;
    }
    zScoreToPercentile(zScore) {
        const a1 = 0.254829592;
        const a2 = -0.284496736;
        const a3 = 1.421413741;
        const a4 = -1.453152027;
        const a5 = 1.061405429;
        const p = 0.3275911;
        const sign = zScore < 0 ? -1 : 1;
        const z = Math.abs(zScore) / Math.sqrt(2);
        const t = 1.0 / (1.0 + p * z);
        const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
        const percentile = 0.5 * (1.0 + sign * y) * 100;
        return Math.round(percentile * 10) / 10;
    }
    calculateGrowthMetrics(weight, height, headCircumference, ageInMonths, gender) {
        const weightRef = gender === 'male' ? WHO_WEIGHT_FOR_AGE_BOYS : WHO_WEIGHT_FOR_AGE_GIRLS;
        const heightRef = gender === 'male' ? WHO_HEIGHT_FOR_AGE_BOYS : WHO_HEIGHT_FOR_AGE_GIRLS;
        const headRef = gender === 'male' ? WHO_HEAD_CIRCUMFERENCE_BOYS : WHO_HEAD_CIRCUMFERENCE_GIRLS;
        const weightAge = this.getClosestReferenceAge(ageInMonths, weightRef);
        const heightAge = this.getClosestReferenceAge(ageInMonths, heightRef);
        const headAge = this.getClosestReferenceAge(ageInMonths, headRef);
        const weightData = weightRef[weightAge];
        const heightData = heightRef[heightAge];
        const headData = headRef[headAge];
        const weightZScore = this.calculateZScore(weight, weightData.median, weightData.sd);
        const heightZScore = this.calculateZScore(height, heightData.median, heightData.sd);
        const headCircumferenceZScore = headCircumference && headData
            ? this.calculateZScore(headCircumference, headData.median, headData.sd)
            : null;
        const weightPercentile = this.zScoreToPercentile(weightZScore);
        const heightPercentile = this.zScoreToPercentile(heightZScore);
        const headCircumferencePercentile = headCircumferenceZScore
            ? this.zScoreToPercentile(headCircumferenceZScore)
            : null;
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        const bmiZScore = (weightZScore + heightZScore) / 2;
        const bmiPercentile = this.zScoreToPercentile(bmiZScore);
        return {
            weightPercentile,
            heightPercentile,
            headCircumferencePercentile,
            weightZScore: Math.round(weightZScore * 100) / 100,
            heightZScore: Math.round(heightZScore * 100) / 100,
            headCircumferenceZScore: headCircumferenceZScore
                ? Math.round(headCircumferenceZScore * 100) / 100
                : null,
            bmi: Math.round(bmi * 100) / 100,
            bmiPercentile,
            bmiZScore: Math.round(bmiZScore * 100) / 100,
        };
    }
    async getChildMeasurements(childId) {
        const child = await this.prisma.child.findUnique({
            where: { id: childId },
        });
        if (!child) {
            throw new common_1.NotFoundException('Child not found');
        }
        const measurements = await this.prisma.growthMeasurement.findMany({
            where: { childId },
            orderBy: { measurementDate: 'asc' },
        });
        const latestMeasurement = measurements.length > 0
            ? measurements[measurements.length - 1]
            : null;
        const summary = latestMeasurement ? {
            latestWeight: latestMeasurement.weight,
            latestHeight: latestMeasurement.height,
            latestHeadCircumference: latestMeasurement.headCircumference,
            latestWeightPercentile: latestMeasurement.weightPercentile,
            latestHeightPercentile: latestMeasurement.heightPercentile,
            latestHeadCircumferencePercentile: latestMeasurement.headCircumferencePercentile,
            totalMeasurements: measurements.length,
            lastMeasurementDate: latestMeasurement.measurementDate,
        } : null;
        return {
            childId,
            childName: `${child.firstName} ${child.lastName}`,
            dateOfBirth: child.dateOfBirth,
            gender: child.gender,
            birthWeight: child.birthWeight,
            birthHeight: child.birthHeight,
            birthHeadCircumference: child.birthHeadCircumference,
            measurements,
            summary,
        };
    }
    async addMeasurement(childId, dto) {
        const child = await this.prisma.child.findUnique({
            where: { id: childId },
        });
        if (!child) {
            throw new common_1.NotFoundException('Child not found');
        }
        const measurementDate = new Date(dto.measurementDate);
        const ageInMonths = this.calculateAgeInMonths(child.dateOfBirth, measurementDate);
        const ageInDays = this.calculateAgeInDays(child.dateOfBirth, measurementDate);
        const metrics = this.calculateGrowthMetrics(dto.weight, dto.height, dto.headCircumference || null, ageInMonths, child.gender);
        const measurement = await this.prisma.growthMeasurement.create({
            data: {
                childId,
                measurementDate,
                ageInMonths,
                ageInDays,
                weight: dto.weight,
                height: dto.height,
                headCircumference: dto.headCircumference,
                measuredBy: dto.measuredBy,
                location: dto.location,
                notes: dto.notes,
                ...metrics,
            },
        });
        await this.prisma.activity.create({
            data: {
                childId,
                type: 'growth',
                title: `Growth Measurement: ${dto.weight}kg, ${dto.height}cm`,
                description: `Weight: ${dto.weight}kg | Height: ${dto.height}cm${dto.headCircumference ? ` | Head: ${dto.headCircumference}cm` : ''}${dto.notes ? ` | Notes: ${dto.notes}` : ''}`,
                date: measurementDate,
                icon: 'growth',
            },
        });
        return measurement;
    }
    async updateMeasurement(measurementId, dto) {
        const existing = await this.prisma.growthMeasurement.findUnique({
            where: { id: measurementId },
            include: { child: true },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Measurement not found');
        }
        let metrics = {};
        if (dto.weight !== undefined || dto.height !== undefined || dto.headCircumference !== undefined) {
            const weight = dto.weight ?? existing.weight;
            const height = dto.height ?? existing.height;
            const headCircumference = dto.headCircumference ?? existing.headCircumference;
            metrics = this.calculateGrowthMetrics(weight, height, headCircumference, existing.ageInMonths, existing.child.gender);
        }
        let ageUpdates = {};
        if (dto.measurementDate) {
            const measurementDate = new Date(dto.measurementDate);
            ageUpdates = {
                measurementDate,
                ageInMonths: this.calculateAgeInMonths(existing.child.dateOfBirth, measurementDate),
                ageInDays: this.calculateAgeInDays(existing.child.dateOfBirth, measurementDate),
            };
        }
        const measurement = await this.prisma.growthMeasurement.update({
            where: { id: measurementId },
            data: {
                ...dto,
                ...ageUpdates,
                ...metrics,
            },
        });
        return measurement;
    }
    async deleteMeasurement(measurementId) {
        const existing = await this.prisma.growthMeasurement.findUnique({
            where: { id: measurementId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Measurement not found');
        }
        await this.prisma.growthMeasurement.delete({
            where: { id: measurementId },
        });
        return { message: 'Measurement deleted successfully' };
    }
    async getChartData(childId, chartType) {
        const child = await this.prisma.child.findUnique({
            where: { id: childId },
        });
        if (!child) {
            throw new common_1.NotFoundException('Child not found');
        }
        const measurements = await this.prisma.growthMeasurement.findMany({
            where: { childId },
            orderBy: { measurementDate: 'asc' },
            select: {
                measurementDate: true,
                ageInMonths: true,
                weight: true,
                height: true,
                headCircumference: true,
                weightPercentile: true,
                heightPercentile: true,
                headCircumferencePercentile: true,
            },
        });
        const referenceData = this.getWHOReferenceData(child.gender, chartType);
        const dataPoints = measurements.map((m) => ({
            date: m.measurementDate,
            ageInMonths: m.ageInMonths,
            value: chartType === 'weight' ? m.weight : chartType === 'height' ? m.height : m.headCircumference,
            percentile: chartType === 'weight'
                ? m.weightPercentile
                : chartType === 'height'
                    ? m.heightPercentile
                    : m.headCircumferencePercentile,
        }));
        return {
            childId,
            chartType,
            gender: child.gender,
            dataPoints,
            referenceData,
        };
    }
    getWHOReferenceData(gender, chartType) {
        let referenceData;
        switch (chartType) {
            case 'weight':
                referenceData = gender === 'male' ? WHO_WEIGHT_FOR_AGE_BOYS : WHO_WEIGHT_FOR_AGE_GIRLS;
                break;
            case 'height':
                referenceData = gender === 'male' ? WHO_HEIGHT_FOR_AGE_BOYS : WHO_HEIGHT_FOR_AGE_GIRLS;
                break;
            case 'head':
                referenceData = gender === 'male' ? WHO_HEAD_CIRCUMFERENCE_BOYS : WHO_HEAD_CIRCUMFERENCE_GIRLS;
                break;
        }
        const percentileZScores = {
            p3: -1.88,
            p15: -1.04,
            p50: 0,
            p85: 1.04,
            p97: 1.88,
        };
        const ages = Object.keys(referenceData).map(Number).sort((a, b) => a - b);
        const percentileLines = {
            p3: [],
            p15: [],
            p50: [],
            p85: [],
            p97: [],
        };
        for (const age of ages) {
            const { median, sd } = referenceData[age];
            for (const [percentile, zScore] of Object.entries(percentileZScores)) {
                const value = median + zScore * sd;
                percentileLines[percentile].push({ age, value: Math.round(value * 10) / 10 });
            }
        }
        return percentileLines;
    }
};
exports.GrowthService = GrowthService;
exports.GrowthService = GrowthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GrowthService);
//# sourceMappingURL=growth.service.js.map