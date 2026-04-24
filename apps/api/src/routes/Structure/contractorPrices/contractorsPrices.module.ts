import { Module } from '@nestjs/common';
import { ContractorsPricesService } from './contractorsPrices.service';
import { ContractorsPricesController } from './contractorsPrices.controller';

@Module({
  controllers: [ContractorsPricesController],
  providers: [ContractorsPricesService],
})
export class ContractorsPricesModule {}
