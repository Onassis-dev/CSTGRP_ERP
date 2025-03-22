import { Module } from '@nestjs/common';
import { EmployeesModule } from './employees/employees.module';
import { AssistanceModule } from './assistance/assistance.module';
import { StatsModule } from './stats/stats.module';
import { VariousModule } from './various/various.module';
import { ProductivityModule } from './productivity/productivity.module';
import { RecordsModule } from './records/records.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { DocumentsModule } from './documents/documents.module';
import { KioskModule } from './kiosk/kiosk.module';
@Module({
  imports: [
    EmployeesModule,
    AssistanceModule,
    StatsModule,
    VariousModule,
    ProductivityModule,
    RecordsModule,
    EvaluationsModule,
    DocumentsModule,
    EvaluationsModule,
    KioskModule,
  ],
})
export class HRModule {}
