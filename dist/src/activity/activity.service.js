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
    async assertChildAccess(actor, childId) {
        const child = await this.prisma.child.findUnique({
            where: { id: childId },
        });
        if (!child) {
            throw new common_1.NotFoundException('Child not found');
        }
        if (actor.actorType === 'midwife') {
            if (child.midwifeId !== actor.id) {
                throw new common_1.ForbiddenException('Access denied');
            }
        }
        else if (child.userId !== actor.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return child;
    }
    async assertActivityAccess(actor, id) {
        const activity = await this.prisma.activity.findUnique({
            where: { id },
            include: { child: true },
        });
        if (!activity) {
            throw new common_1.NotFoundException(`Activity with ID ${id} not found`);
        }
        if (actor.actorType === 'midwife') {
            if (activity.child.midwifeId !== actor.id) {
                throw new common_1.ForbiddenException('Access denied');
            }
        }
        else if (activity.child.userId !== actor.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return activity;
    }
    async getActorActivities(actor) {
        return this.prisma.activity.findMany({
            where: {
                child: actor.actorType === 'midwife'
                    ? { midwifeId: actor.id }
                    : { userId: actor.id },
            },
            include: {
                child: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
            orderBy: { date: 'desc' },
        });
    }
    async getChildActivities(actor, childId) {
        await this.assertChildAccess(actor, childId);
        return this.prisma.activity.findMany({
            where: { childId },
            orderBy: { date: 'desc' },
            include: {
                child: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
    }
    async getActivity(actor, id) {
        return this.assertActivityAccess(actor, id);
    }
    async createActivity(actor, childId, dto) {
        await this.assertChildAccess(actor, childId);
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
    async updateActivity(actor, id, dto) {
        await this.assertActivityAccess(actor, id);
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
    async deleteActivity(actor, id) {
        await this.assertActivityAccess(actor, id);
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