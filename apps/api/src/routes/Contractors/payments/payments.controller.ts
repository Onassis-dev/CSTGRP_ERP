import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  downloadPaymentsSchema,
  getDeliveriesForPaymentSchema,
} from './payments.schema';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { PaymentsService } from './payments.service';

@Controller('contractors/payments')
@UseGuards(new AuthGuard('contractors_payments'))
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('download')
  download(@Query(new ZodPiPe(downloadPaymentsSchema)) query) {
    return this.paymentsService.download(query);
  }

  @Get('deliveries-for-payment')
  getDeliveriesForPayment(
    @Query(new ZodPiPe(getDeliveriesForPaymentSchema)) query,
  ) {
    return this.paymentsService.getDeliveriesForPayment(query);
  }
}
