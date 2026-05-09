import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
