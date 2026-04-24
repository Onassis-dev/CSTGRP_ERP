import { Module } from '@nestjs/common';
import { ExitPassService } from './exitPass.service';
import { ExitPassController } from './exitPass.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [ExitPassController],
  providers: [
    ExitPassService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'production',
    },
  ],
})
export class ExitPassModule {}
