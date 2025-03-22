import { Module } from '@nestjs/common';
import { RequisitionsService } from './requsitions.service';
import { RequisitionsController } from './requisitions.controller';
import { ContextProvider } from 'src/interceptors/context.provider';
import { PetitionsService } from '../petitions/petitions.service';
@Module({
  controllers: [RequisitionsController],
  providers: [
    RequisitionsService,
    ContextProvider,
    PetitionsService,
    {
      provide: 'MODULE',
      useValue: 'inventory',
    },
  ],
})
export class RequisitionsModule {}
