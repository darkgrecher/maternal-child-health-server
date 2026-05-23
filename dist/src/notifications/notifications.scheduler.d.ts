import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
export declare class NotificationsScheduler {
    private readonly prisma;
    private readonly notificationsService;
    private readonly logger;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    handleAppointmentReminders(): Promise<void>;
    handleVaccinationReminders(): Promise<void>;
    handleDailyDigest(): Promise<void>;
    private logRun;
}
