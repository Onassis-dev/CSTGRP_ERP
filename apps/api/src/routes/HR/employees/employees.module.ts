import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { ContextProvider } from 'src/interceptors/context.provider';

@Module({
  controllers: [EmployeesController],
  providers: [
    EmployeesService,
    ContextProvider,
    {
      provide: 'MODULE',
      useValue: 'hr',
    },
  ],
})
export class EmployeesModule {}
