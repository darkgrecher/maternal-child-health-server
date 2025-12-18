import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ChildModule } from './child/child.module';
import { VaccineModule } from './vaccine/vaccine.module';
import { GrowthModule } from './growth/growth.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
