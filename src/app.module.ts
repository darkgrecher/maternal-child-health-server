import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ChildModule } from './child/child.module';
import { PregnancyModule } from './pregnancy/pregnancy.module';
import { VaccineModule } from './vaccine/vaccine.module';
import { GrowthModule } from './growth/growth.module';
import { AppointmentModule } from './appointment/appointment.module';
import { ActivityModule } from './activity/activity.module';
import { EmergencyContactModule } from './emergency-contact/emergency-contact.module';
import { MidwifeLinkModule } from './midwife-link/midwife-link.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';
import { AdminAnalyticsModule } from './admin-analytics/admin-analytics.module';
import { AdminDistrictsModule } from './admin-districts/admin-districts.module';
import { AdminAlertsModule } from './admin-alerts/admin-alerts.module';
import { AdminLogsModule } from './admin-logs/admin-logs.module';
import { AdminReportsModule } from './admin-reports/admin-reports.module';
import { AdminNotificationsModule } from './admin-notifications/admin-notifications.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    ChildModule,
    PregnancyModule,
    VaccineModule,
    GrowthModule,
    AppointmentModule,
    ActivityModule,
    EmergencyContactModule,
    MidwifeLinkModule,
    DashboardModule,
    SettingsModule,
    AdminAnalyticsModule,
    AdminDistrictsModule,
    AdminAlertsModule,
    AdminLogsModule,
    AdminReportsModule,
    AdminNotificationsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
