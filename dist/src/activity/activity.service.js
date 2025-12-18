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
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ActivityService = class ActivityService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getChildActivities(childId) {
        const activities = await this.prisma.activity.findMany({
            where: { childId },
            orderBy: { date: 'desc' },
        });
        return activities;
    }
    async getActivity(id) {
        const activity = await this.prisma.activity.findUnique({
            where: { id },
        });
        if (!activity) {
            throw new common_1.NotFoundException(`Activity with ID ${id} not found`);
        }
        return activity;
    }
    async createActivity(childId, dto) {
        const activity = await this.prisma.activity.create({
            data: {
                childId,
                type: dto.type,
                title: dto.title,
                description: dto.description,
                date: dto.date ? new Date(dto.date) : new Date(),
                icon: dto.icon,
            },
        });
        return activity;
    }
    async updateActivity(id, dto) {
        await this.getActivity(id);
        const activity = await this.prisma.activity.update({
            where: { id },
            data: {
                ...(dto.type && { type: dto.type }),
                ...(dto.title && { title: dto.title }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.date && { date: new Date(dto.date) }),
                ...(dto.icon !== undefined && { icon: dto.icon }),
            },
        });
        return activity;
    }
    async deleteActivity(id) {
        await this.getActivity(id);
        await this.prisma.activity.delete({
            where: { id },
        });
        return { message: 'Activity deleted successfully' };
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivityService);
//# sourceMappingURL=activity.service.js.map