import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LogActorType, LogLevel, NotificationType, Prisma, RecipientActorType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

const MS_PER_HOUR = 60 * 60 * 1000;

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('0 * * * *')
  async handleAppointmentReminders() {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + 24 * MS_PER_HOUR);

    let processed = 0;
    let failures = 0;
    let pushAttempts = 0;
    let pushFailures = 0;

    try {
      const appointments = await this.prisma.appointment.findMany({
        where: {
          status: 'scheduled',
          reminderSent: false,
          dateTime: {
            gte: now,
            lte: windowEnd,
          },
        },
        include: {
          child: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              userId: true,
              midwifeId: true,
              midwife: {
                select: {
                  id: true,
                  notifyAppointments: true,
                },
              },
            },
          },
        },
      });

      for (const appointment of appointments) {
        try {
          const child = appointment.child;
          const childName = `${child.firstName} ${child.lastName}`.trim();
          const scheduleLabel = appointment.dateTime.toLocaleString();

          const userActor = {
            id: child.userId,
            actorType: RecipientActorType.user,
          };

          const userRecipient = await this.notificationsService.createInAppNotificationForActor(
            userActor,
            {
              type: NotificationType.appointment,
              title: 'Appointment reminder',
              message: `Reminder: ${childName} has an appointment on ${scheduleLabel}.`,
              data: {
                appointmentId: appointment.id,
                childId: child.id,
                childName,
                dateTime: appointment.dateTime.toISOString(),
              },
              sentAt: new Date(),
            },
          );

          const userDelivery = await this.notificationsService.deliverExpoPushToActor(userActor, {
            title: 'Appointment reminder',
            message: `Reminder: ${childName} has an appointment on ${scheduleLabel}.`,
            data: {
              appointmentId: appointment.id,
            },
          });

          pushAttempts += 1;
          if (userDelivery.deliveryError) {
            pushFailures += 1;
          }

          await this.notificationsService.recordRecipientDelivery(userRecipient.id, userDelivery);

          if (child.midwifeId) {
            const midwifeActor = {
              id: child.midwifeId,
              actorType: RecipientActorType.midwife,
            };

            const midwifeRecipient = await this.notificationsService.createInAppNotificationForActor(
              midwifeActor,
              {
                type: NotificationType.appointment,
                title: 'Upcoming appointment',
                message: `${childName} has an appointment on ${scheduleLabel}.`,
                data: {
                  appointmentId: appointment.id,
                  childId: child.id,
                  childName,
                  dateTime: appointment.dateTime.toISOString(),
                },
                sentAt: new Date(),
              },
            );

            const allowPush = child.midwife?.notifyAppointments ?? true;
            if (allowPush) {
              const delivery = await this.notificationsService.deliverExpoPushToActor(midwifeActor, {
                title: 'Upcoming appointment',
                message: `${childName} has an appointment on ${scheduleLabel}.`,
                data: {
                  appointmentId: appointment.id,
                },
              });

              pushAttempts += 1;
              if (delivery.deliveryError) {
                pushFailures += 1;
              }

              await this.notificationsService.recordRecipientDelivery(midwifeRecipient.id, delivery);
            }
          }

          await this.prisma.appointment.update({
            where: { id: appointment.id },
            data: { reminderSent: true },
          });

          processed += 1;
        } catch (error) {
          failures += 1;
          const trace = (error as Error).stack ?? String(error);
          this.logger.error('Failed to send appointment reminder', trace);
        }
      }

      await this.logRun('notifications.appointments', 'Appointment reminders processed', {
        processed,
        failures,
        pushAttempts,
        pushFailures,
      });
    } catch (error) {
      await this.logRun('notifications.appointments', 'Appointment reminders failed', {
        error: (error as Error).message,
      }, LogLevel.error);
    }
  }

  @Cron('0 7 * * *')
  async handleVaccinationReminders() {
    const now = new Date();
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const endOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59, 999);

    let processed = 0;
    let failures = 0;
    let pushAttempts = 0;
    let pushFailures = 0;

    try {
      const records = await this.prisma.vaccinationRecord.findMany({
        where: {
          administeredDate: null,
          status: { in: ['pending', 'scheduled'] },
          scheduledDate: {
            gte: startOfTomorrow,
            lte: endOfTomorrow,
          },
        },
        include: {
          child: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              userId: true,
              midwifeId: true,
              midwife: {
                select: {
                  id: true,
                  notifyVaccinations: true,
                },
              },
            },
          },
          vaccine: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      for (const record of records) {
        try {
          const child = record.child;
          const childName = `${child.firstName} ${child.lastName}`.trim();
          const scheduleLabel = record.scheduledDate.toLocaleDateString();
          const vaccineName = record.vaccine.name;

          const userActor = {
            id: child.userId,
            actorType: RecipientActorType.user,
          };

          const userRecipient = await this.notificationsService.createInAppNotificationForActor(
            userActor,
            {
              type: NotificationType.vaccination,
              title: 'Vaccination reminder',
              message: `${childName} is due for ${vaccineName} on ${scheduleLabel}.`,
              data: {
                vaccinationRecordId: record.id,
                vaccineId: record.vaccine.id,
                childId: child.id,
                scheduledDate: record.scheduledDate.toISOString(),
              },
              sentAt: new Date(),
            },
          );

          const userDelivery = await this.notificationsService.deliverExpoPushToActor(userActor, {
            title: 'Vaccination reminder',
            message: `${childName} is due for ${vaccineName} on ${scheduleLabel}.`,
            data: {
              vaccinationRecordId: record.id,
            },
          });

          pushAttempts += 1;
          if (userDelivery.deliveryError) {
            pushFailures += 1;
          }

          await this.notificationsService.recordRecipientDelivery(userRecipient.id, userDelivery);

          if (child.midwifeId) {
            const midwifeActor = {
              id: child.midwifeId,
              actorType: RecipientActorType.midwife,
            };

            const midwifeRecipient = await this.notificationsService.createInAppNotificationForActor(
              midwifeActor,
              {
                type: NotificationType.vaccination,
                title: 'Vaccination due soon',
                message: `${childName} is due for ${vaccineName} on ${scheduleLabel}.`,
                data: {
                  vaccinationRecordId: record.id,
                  vaccineId: record.vaccine.id,
                  childId: child.id,
                  scheduledDate: record.scheduledDate.toISOString(),
                },
                sentAt: new Date(),
              },
            );

            const allowPush = child.midwife?.notifyVaccinations ?? true;
            if (allowPush) {
              const delivery = await this.notificationsService.deliverExpoPushToActor(midwifeActor, {
                title: 'Vaccination due soon',
                message: `${childName} is due for ${vaccineName} on ${scheduleLabel}.`,
                data: {
                  vaccinationRecordId: record.id,
                },
              });

              pushAttempts += 1;
              if (delivery.deliveryError) {
                pushFailures += 1;
              }

              await this.notificationsService.recordRecipientDelivery(midwifeRecipient.id, delivery);
            }
          }

          processed += 1;
        } catch (error) {
          failures += 1;
          const trace = (error as Error).stack ?? String(error);
          this.logger.error('Failed to send vaccination reminder', trace);
        }
      }

      await this.logRun('notifications.vaccinations', 'Vaccination reminders processed', {
        processed,
        failures,
        pushAttempts,
        pushFailures,
      });
    } catch (error) {
      await this.logRun('notifications.vaccinations', 'Vaccination reminders failed', {
        error: (error as Error).message,
      }, LogLevel.error);
    }
  }

  @Cron('0 18 * * *')
  async handleDailyDigest() {
    let processed = 0;
    let failures = 0;
    let pushAttempts = 0;
    let pushFailures = 0;

    try {
      const midwives = await this.prisma.midwife.findMany({
        select: {
          id: true,
          notifyDailyDigest: true,
        },
      });

      const tomorrowStart = new Date();
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      tomorrowStart.setHours(0, 0, 0, 0);
      const tomorrowEnd = new Date(tomorrowStart);
      tomorrowEnd.setHours(23, 59, 59, 999);

      for (const midwife of midwives) {
        try {
          const [appointmentsCount, overdueVaccinations, highRiskPregnancies] = await Promise.all([
            this.prisma.appointment.count({
              where: {
                child: { midwifeId: midwife.id },
                status: 'scheduled',
                dateTime: {
                  gte: tomorrowStart,
                  lte: tomorrowEnd,
                },
              },
            }),
            this.prisma.vaccinationRecord.count({
              where: {
                child: { midwifeId: midwife.id },
                status: { in: ['overdue', 'missed'] },
              },
            }),
            this.prisma.pregnancy.count({
              where: {
                midwifeId: midwife.id,
                status: 'active',
                isHighRisk: true,
              },
            }),
          ]);

          const midwifeActor = {
            id: midwife.id,
            actorType: RecipientActorType.midwife,
          };

          const message = `Daily summary: ${appointmentsCount} appointments tomorrow, ${overdueVaccinations} overdue vaccinations, ${highRiskPregnancies} high-risk pregnancies.`;

          const recipient = await this.notificationsService.createInAppNotificationForActor(
            midwifeActor,
            {
              type: NotificationType.daily_digest,
              title: 'Daily digest',
              message,
              data: {
                appointmentsTomorrow: appointmentsCount,
                overdueVaccinations,
                highRiskPregnancies,
              },
              sentAt: new Date(),
            },
          );

          if (midwife.notifyDailyDigest ?? false) {
            const delivery = await this.notificationsService.deliverExpoPushToActor(midwifeActor, {
              title: 'Daily digest',
              message,
              data: {
                appointmentsTomorrow: appointmentsCount,
              },
            });

            pushAttempts += 1;
            if (delivery.deliveryError) {
              pushFailures += 1;
            }

            await this.notificationsService.recordRecipientDelivery(recipient.id, delivery);
          }

          processed += 1;
        } catch (error) {
          failures += 1;
          const trace = (error as Error).stack ?? String(error);
          this.logger.error('Failed to send daily digest', trace);
        }
      }

      await this.logRun('notifications.daily_digest', 'Daily digest processed', {
        processed,
        failures,
        pushAttempts,
        pushFailures,
      });
    } catch (error) {
      await this.logRun('notifications.daily_digest', 'Daily digest failed', {
        error: (error as Error).message,
      }, LogLevel.error);
    }
  }

  private async logRun(
    event: string,
    message: string,
    metadata: Prisma.InputJsonValue,
    level: LogLevel = LogLevel.info,
  ) {
    await this.prisma.systemLog.create({
      data: {
        level,
        source: 'scheduler',
        event,
        message,
        metadata,
        actorType: LogActorType.system,
      },
    });
  }
}
