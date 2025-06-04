import { Module } from '@nestjs/common';
import { FormatsController } from './formats.controller';
import { FormatsService } from './formats.service';

@Module({
  controllers: [FormatsController],
  providers: [FormatsService],
})
export class FormatsModule {}
