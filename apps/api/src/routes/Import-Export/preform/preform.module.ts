import { Module } from '@nestjs/common';
import { PreformController } from './preform.controller';
import { ContextProvider } from 'src/interceptors/context.provider';
import { PreformService } from './preform.service';

@Module({
  controllers: [PreformController],
  providers: [
    PreformService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'ie',
    },
  ],
})
export class PreformModule {}
