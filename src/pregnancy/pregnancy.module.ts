/**
 * Pregnancy Module
 * 
 * Module for managing pregnancy profiles and their conversion to child profiles.
 */

import { Module } from '@nestjs/common';
import { PregnancyController } from './pregnancy.controller';
import { PregnancyService } from './pregnancy.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PregnancyController],
  providers: [PregnancyService],
  exports: [PregnancyService],
})
export class PregnancyModule {}
