import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminDistrictsController } from './admin-districts.controller';
import { AdminDistrictsService } from './admin-districts.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdminDistrictsController],
  providers: [AdminDistrictsService],
})
export class AdminDistrictsModule {}
