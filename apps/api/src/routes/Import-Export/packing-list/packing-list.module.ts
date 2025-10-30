import { Module } from '@nestjs/common';
import { PackingListController } from './packing-list.controller';
import { ContextProvider } from 'src/interceptors/context.provider';
import { PackingListService } from './packing-list.service';

@Module({
  controllers: [PackingListController],
  providers: [
    PackingListService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'ie',
    },
  ],
})
export class PackingListModule {}
