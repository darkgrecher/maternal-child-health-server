import { Module } from '@nestjs/common';
import { EmergencyContactController } from './emergency-contact.controller';
import { EmergencyContactService } from './emergency-contact.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EmergencyContactController],
  providers: [EmergencyContactService],
  exports: [EmergencyContactService],
})
export class EmergencyContactModule {}
