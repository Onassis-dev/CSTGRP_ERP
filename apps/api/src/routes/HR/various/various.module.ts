import { Module } from '@nestjs/common';
import { VariousController } from './various.controller';
import { VariousService } from './various.service';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [VariousController],
  providers: [
    VariousService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: '',
    },
  ],
})
export class VariousModule {}
