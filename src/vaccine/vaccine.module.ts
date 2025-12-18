/**
 * Vaccine Module
 */

import { Module } from '@nestjs/common';
import { VaccineController } from './vaccine.controller';
import { VaccineService } from './vaccine.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VaccineController],
  providers: [VaccineService],
  exports: [VaccineService],
})
export class VaccineModule {}
