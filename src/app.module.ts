import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ChildModule } from './child/child.module';
import { VaccineModule } from './vaccine/vaccine.module';
import { GrowthModule } from './growth/growth.module';
import { AppointmentModule } from './appointment/appointment.module';
import { ActivityModule } from './activity/activity.module';
import { EmergencyContactModule } from './emergency-contact/emergency-contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    ChildModule,
    VaccineModule,
    GrowthModule,
    AppointmentModule,
    ActivityModule,
    EmergencyContactModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
