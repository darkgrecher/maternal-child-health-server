/**
 * Midwife Link Module
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MidwifeLinkController } from './midwife-link.controller';
import { MidwifeLinkService } from './midwife-link.service';

@Module({
  imports: [PrismaModule],
  controllers: [MidwifeLinkController],
  providers: [MidwifeLinkService],
})
export class MidwifeLinkModule {}
