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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const guards_1 = require("../auth/guards");
const notifications_service_1 = require("./notifications.service");
const dto_1 = require("./dto");
let NotificationsController = class NotificationsController {
    notificationsService;
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    getActor(req) {
        const actorId = req.user?.sub;
        if (!actorId) {
            throw new common_1.BadRequestException('User ID not found in token. Please log out and log in again.');
        }
        return {
            id: actorId,
            actorType: req.user?.actorType || 'user',
            role: req.user?.role,
        };
    }
    assertUserOrMidwife(actorType) {
        if (actorType !== 'user' && actorType !== 'midwife') {
            throw new common_1.ForbiddenException('User or midwife access required');
        }
    }
    assertAdmin(actorType, role) {
        if (actorType !== 'midwife' || role !== 'admin') {
            throw new common_1.ForbiddenException('Admin access required');
        }
    }
    async registerDevice(req, dto) {
        const actor = this.getActor(req);
        this.assertUserOrMidwife(actor.actorType);
        const data = await this.notificationsService.registerDeviceToken(actor, {
            deviceId: dto.deviceId,
            token: dto.token,
            isActive: dto.isActive,
            lastUsedAt: dto.lastUsedAt,
        });
        return { success: true, data };
    }
    async registerSubscription(req, dto) {
        const actor = this.getActor(req);
        this.assertUserOrMidwife(actor.actorType);
        const data = await this.notificationsService.registerWebPushSubscription(actor, {
            endpoint: dto.endpoint,
            p256dh: dto.p256dh,
            auth: dto.auth,
            userAgent: dto.userAgent,
            isActive: dto.isActive,
        });
        return { success: true, data };
    }
    async listNotifications(req) {
        const actor = this.getActor(req);
        this.assertUserOrMidwife(actor.actorType);
        const data = await this.notificationsService.listNotificationsForActor(actor);
        return { success: true, data };
    }
    async markRead(req, id) {
        const actor = this.getActor(req);
        this.assertUserOrMidwife(actor.actorType);
        const data = await this.notificationsService.markRead(id, actor);
        return { success: true, data };
    }
    async createTestNotification(req, dto) {
        const actor = this.getActor(req);
        this.assertAdmin(actor.actorType, actor.role);
        const data = await this.notificationsService.createNotificationForActor(actor, {
            type: dto.type,
            channel: dto.channel,
            title: dto.title,
            message: dto.message,
            data: dto.data ?? undefined,
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        });
        return { success: true, data };
    }
    async sendTestPush(req, dto) {
        const actor = this.getActor(req);
        this.assertUserOrMidwife(actor.actorType);
        const data = await this.notificationsService.sendTestPushToActor(actor, {
            title: dto.title,
            message: dto.message,
            data: dto.data,
        });
        return { success: true, data };
    }
    async sendTestWebPush(req, dto) {
        const actor = this.getActor(req);
        this.assertUserOrMidwife(actor.actorType);
        const data = await this.notificationsService.sendTestWebPushToActor(actor, {
            title: dto.title,
            message: dto.message,
            data: dto.data,
        });
        return { success: true, data };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)('devices'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.RegisterDeviceTokenDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "registerDevice", null);
__decorate([
    (0, common_1.Post)('subscriptions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.RegisterWebPushSubscriptionDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "registerSubscription", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "listNotifications", null);
__decorate([
    (0, common_1.Put)(':id/read'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markRead", null);
__decorate([
    (0, common_1.Post)('test'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateTestNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createTestNotification", null);
__decorate([
    (0, common_1.Post)('push/test'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateTestPushDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendTestPush", null);
__decorate([
    (0, common_1.Post)('web-push/test'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.CreateTestWebPushDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendTestWebPush", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map