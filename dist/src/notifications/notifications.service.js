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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const expo_server_sdk_1 = require("expo-server-sdk");
const web_push_1 = __importDefault(require("web-push"));
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mapNotificationRecipient(record) {
        return {
            id: record.notification.id,
            recipientId: record.id,
            type: record.notification.type,
            channel: record.notification.channel,
            title: record.notification.title,
            message: record.notification.message,
            data: record.notification.data ?? null,
            scheduledAt: record.notification.scheduledAt
                ? record.notification.scheduledAt.toISOString()
                : null,
            sentAt: record.notification.sentAt ? record.notification.sentAt.toISOString() : null,
            createdAt: record.notification.createdAt.toISOString(),
            isRead: record.isRead,
            readAt: record.readAt ? record.readAt.toISOString() : null,
            deliveredAt: record.deliveredAt ? record.deliveredAt.toISOString() : null,
            deliveryError: record.deliveryError ?? null,
        };
    }
    mapDeviceToken(record) {
        return {
            id: record.id,
            deviceId: record.deviceId,
            token: record.token,
            actorType: record.actorType,
            actorId: record.actorId,
            isActive: record.isActive,
            lastUsedAt: record.lastUsedAt ? record.lastUsedAt.toISOString() : null,
            createdAt: record.createdAt.toISOString(),
        };
    }
    mapSubscription(record) {
        return {
            id: record.id,
            endpoint: record.endpoint,
            actorType: record.actorType,
            actorId: record.actorId,
            userAgent: record.userAgent ?? null,
            isActive: record.isActive,
            createdAt: record.createdAt.toISOString(),
            updatedAt: record.updatedAt.toISOString(),
        };
    }
    parseDate(value) {
        if (!value)
            return undefined;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    }
    getVapidConfig() {
        const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
        const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
        const subject = process.env.VAPID_SUBJECT?.trim();
        if (!publicKey && !privateKey && !subject) {
            return null;
        }
        if (!publicKey || !privateKey || !subject) {
            throw new common_1.BadRequestException('VAPID keys are not fully configured');
        }
        return { publicKey, privateKey, subject };
    }
    async getRecipientForActor(notificationId, actor) {
        return this.prisma.notificationRecipient.findFirst({
            where: {
                notificationId,
                actorType: actor.actorType,
                actorId: actor.id,
            },
            include: { notification: true },
        });
    }
    async createNotification(input) {
        return this.prisma.notification.create({
            data: {
                type: input.type,
                channel: input.channel,
                title: input.title,
                message: input.message,
                data: input.data ?? undefined,
                scheduledAt: input.scheduledAt ?? undefined,
                sentAt: input.sentAt ?? undefined,
            },
        });
    }
    async createInAppNotificationForActor(actor, input) {
        const notification = await this.createNotification({
            ...input,
            channel: client_1.NotificationChannel.in_app,
        });
        return this.prisma.notificationRecipient.create({
            data: {
                notificationId: notification.id,
                actorType: actor.actorType,
                actorId: actor.id,
            },
            include: { notification: true },
        });
    }
    async addRecipients(notificationId, recipients) {
        if (!recipients.length)
            return [];
        await this.prisma.notificationRecipient.createMany({
            data: recipients.map((recipient) => ({
                notificationId,
                actorType: recipient.actorType,
                actorId: recipient.actorId,
            })),
            skipDuplicates: true,
        });
        const lookup = recipients.map((recipient) => ({
            actorType: recipient.actorType,
            actorId: recipient.actorId,
        }));
        return this.prisma.notificationRecipient.findMany({
            where: {
                notificationId,
                OR: lookup,
            },
            include: { notification: true },
        });
    }
    async createNotificationForActor(actor, input) {
        const notification = await this.createNotification(input);
        await this.addRecipients(notification.id, [
            { actorType: actor.actorType, actorId: actor.id },
        ]);
        const recipient = await this.getRecipientForActor(notification.id, actor);
        if (!recipient) {
            throw new common_1.NotFoundException('Notification recipient not found');
        }
        return this.mapNotificationRecipient(recipient);
    }
    async listNotificationsForActor(actor) {
        const records = await this.prisma.notificationRecipient.findMany({
            where: { actorType: actor.actorType, actorId: actor.id },
            include: { notification: true },
            orderBy: { notification: { createdAt: 'desc' } },
        });
        return records.map((record) => this.mapNotificationRecipient(record));
    }
    async markRead(notificationId, actor) {
        const recipient = await this.getRecipientForActor(notificationId, actor);
        if (!recipient) {
            throw new common_1.NotFoundException('Notification not found');
        }
        const updated = await this.prisma.notificationRecipient.update({
            where: { id: recipient.id },
            data: { isRead: true, readAt: new Date() },
            include: { notification: true },
        });
        return this.mapNotificationRecipient(updated);
    }
    async updateRecipientDelivery(recipientId, delivery) {
        return this.prisma.notificationRecipient.update({
            where: { id: recipientId },
            data: {
                deliveredAt: delivery.deliveredAt ?? undefined,
                deliveryError: delivery.deliveryError ?? undefined,
            },
            include: { notification: true },
        });
    }
    async recordRecipientDelivery(recipientId, delivery) {
        return this.updateRecipientDelivery(recipientId, delivery);
    }
    async storeDeliveryError(notificationId, actor, error) {
        const recipient = await this.getRecipientForActor(notificationId, actor);
        if (!recipient) {
            throw new common_1.NotFoundException('Notification recipient not found');
        }
        await this.prisma.notificationRecipient.update({
            where: { id: recipient.id },
            data: { deliveryError: error },
        });
    }
    async deliverExpoPushToActor(actor, input) {
        const tokens = await this.prisma.deviceToken.findMany({
            where: {
                actorType: actor.actorType,
                actorId: actor.id,
                isActive: true,
            },
        });
        if (tokens.length === 0) {
            return { deliveredAt: null, deliveryError: 'No active device tokens' };
        }
        const expo = new expo_server_sdk_1.Expo();
        const messages = [];
        const invalidTokens = [];
        tokens.forEach((token) => {
            if (!expo_server_sdk_1.Expo.isExpoPushToken(token.token)) {
                invalidTokens.push(token.token);
                return;
            }
            messages.push({
                to: token.token,
                title: input.title,
                body: input.message,
                data: input.data,
            });
        });
        if (invalidTokens.length) {
            await this.prisma.deviceToken.updateMany({
                where: { token: { in: invalidTokens } },
                data: { isActive: false },
            });
        }
        const deliveryErrors = [];
        if (invalidTokens.length) {
            deliveryErrors.push(`Invalid Expo tokens: ${invalidTokens.length}`);
        }
        const tickets = [];
        for (const chunk of expo.chunkPushNotifications(messages)) {
            try {
                const chunkTickets = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...chunkTickets);
            }
            catch (error) {
                deliveryErrors.push('Failed to send push notification');
            }
        }
        let deliveredAt = null;
        tickets.forEach((ticket) => {
            if (ticket.status === 'ok') {
                deliveredAt = deliveredAt ?? new Date();
                return;
            }
            const details = ticket.details;
            deliveryErrors.push(details?.error ?? 'Expo push delivery error');
        });
        if (messages.length === 0) {
            deliveryErrors.push('No valid Expo push tokens');
        }
        return {
            deliveredAt,
            deliveryError: deliveryErrors.length ? deliveryErrors.join('; ') : null,
        };
    }
    async registerDeviceToken(actor, input) {
        if (!expo_server_sdk_1.Expo.isExpoPushToken(input.token)) {
            throw new common_1.BadRequestException('Invalid Expo push token');
        }
        const lastUsedAt = this.parseDate(input.lastUsedAt) ?? new Date();
        const isActive = input.isActive ?? true;
        const existingByToken = await this.prisma.deviceToken.findUnique({
            where: { token: input.token },
        });
        if (existingByToken) {
            const updated = await this.prisma.deviceToken.update({
                where: { id: existingByToken.id },
                data: {
                    actorType: actor.actorType,
                    actorId: actor.id,
                    deviceId: input.deviceId,
                    isActive,
                    lastUsedAt,
                },
            });
            return this.mapDeviceToken(updated);
        }
        const token = await this.prisma.deviceToken.upsert({
            where: {
                actorType_actorId_deviceId: {
                    actorType: actor.actorType,
                    actorId: actor.id,
                    deviceId: input.deviceId,
                },
            },
            create: {
                token: input.token,
                deviceId: input.deviceId,
                actorType: actor.actorType,
                actorId: actor.id,
                isActive,
                lastUsedAt,
            },
            update: {
                token: input.token,
                actorType: actor.actorType,
                actorId: actor.id,
                deviceId: input.deviceId,
                isActive,
                lastUsedAt,
            },
        });
        return this.mapDeviceToken(token);
    }
    async sendTestPushToActor(actor, input) {
        const recipient = await this.createInAppNotificationForActor(actor, {
            type: client_1.NotificationType.system,
            title: input.title,
            message: input.message,
            data: input.data ?? undefined,
            sentAt: new Date(),
        });
        const delivery = await this.deliverExpoPushToActor(actor, input);
        const updated = await this.updateRecipientDelivery(recipient.id, delivery);
        return this.mapNotificationRecipient(updated);
    }
    async registerWebPushSubscription(actor, input) {
        const isActive = input.isActive ?? true;
        const subscription = await this.prisma.webPushSubscription.upsert({
            where: {
                actorType_actorId_endpoint: {
                    actorType: actor.actorType,
                    actorId: actor.id,
                    endpoint: input.endpoint,
                },
            },
            create: {
                actorType: actor.actorType,
                actorId: actor.id,
                endpoint: input.endpoint,
                p256dh: input.p256dh,
                auth: input.auth,
                userAgent: input.userAgent,
                isActive,
            },
            update: {
                p256dh: input.p256dh,
                auth: input.auth,
                userAgent: input.userAgent,
                isActive,
            },
        });
        return this.mapSubscription(subscription);
    }
    async sendTestWebPushToActor(actor, input) {
        const notification = await this.prisma.notification.create({
            data: {
                type: client_1.NotificationType.system,
                channel: client_1.NotificationChannel.web_push,
                title: input.title,
                message: input.message,
                data: input.data ?? undefined,
                sentAt: new Date(),
            },
        });
        const recipient = await this.prisma.notificationRecipient.create({
            data: {
                notificationId: notification.id,
                actorType: actor.actorType,
                actorId: actor.id,
            },
            include: { notification: true },
        });
        const subscriptions = await this.prisma.webPushSubscription.findMany({
            where: {
                actorType: actor.actorType,
                actorId: actor.id,
                isActive: true,
            },
        });
        if (subscriptions.length === 0) {
            const updated = await this.prisma.notificationRecipient.update({
                where: { id: recipient.id },
                data: { deliveryError: 'No active web push subscriptions' },
                include: { notification: true },
            });
            return this.mapNotificationRecipient(updated);
        }
        const deliveryErrors = [];
        let deliveredAt = null;
        let vapidConfig = null;
        try {
            vapidConfig = this.getVapidConfig();
        }
        catch (error) {
            const updated = await this.prisma.notificationRecipient.update({
                where: { id: recipient.id },
                data: { deliveryError: error.message },
                include: { notification: true },
            });
            return this.mapNotificationRecipient(updated);
        }
        if (!vapidConfig) {
            const updated = await this.prisma.notificationRecipient.update({
                where: { id: recipient.id },
                data: { deliveryError: 'Web push is not configured' },
                include: { notification: true },
            });
            return this.mapNotificationRecipient(updated);
        }
        web_push_1.default.setVapidDetails(vapidConfig.subject, vapidConfig.publicKey, vapidConfig.privateKey);
        const payload = JSON.stringify({
            title: input.title,
            message: input.message,
            data: input.data ?? null,
        });
        const results = await Promise.allSettled(subscriptions.map((subscription) => web_push_1.default.sendNotification({
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
            },
        }, payload)));
        const inactiveIds = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                deliveredAt = deliveredAt ?? new Date();
                return;
            }
            const error = result.reason;
            const statusCode = error?.statusCode;
            const message = error?.message ?? error?.body ?? 'Web push delivery error';
            deliveryErrors.push(message);
            if (statusCode === 404 || statusCode === 410) {
                inactiveIds.push(subscriptions[index].id);
            }
        });
        if (inactiveIds.length) {
            await this.prisma.webPushSubscription.updateMany({
                where: { id: { in: inactiveIds } },
                data: { isActive: false },
            });
        }
        const updated = await this.prisma.notificationRecipient.update({
            where: { id: recipient.id },
            data: {
                deliveredAt,
                deliveryError: deliveryErrors.length ? deliveryErrors.join('; ') : null,
            },
            include: { notification: true },
        });
        return this.mapNotificationRecipient(updated);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map