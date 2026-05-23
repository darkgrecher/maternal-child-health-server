import { IsObject, IsOptional, IsString } from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateTestPushDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: Prisma.InputJsonObject;
}
