import { Module } from '@nestjs/common';
import { AreasService } from './areas.service';
import { AreasController } from './areas.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [AreasController],
  providers: [
    AreasService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'reports',
    },
  ],
})
export class AreasModule {}
