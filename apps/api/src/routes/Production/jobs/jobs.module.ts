import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [JobsController],
  providers: [
    JobsService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'production',
    },
  ],
})
export class JobsModule {}
