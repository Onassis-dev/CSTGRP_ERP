import { Module } from '@nestjs/common';
import { ContractorsService } from './contractors.service';
import { ContractorsController } from './contractors.controller';

@Module({
  controllers: [ContractorsController],
  providers: [ContractorsService],
})
export class ContractorsModule {}
