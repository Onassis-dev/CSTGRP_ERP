import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  getAllPaymentsSchema,
  createPaymentSchema,
  getDeliveriesForPaymentSchema,
} from './payments.schema';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';
import { PaymentsService } from './payments.service';
import { idObjectSchema } from 'src/utils/schemas';

@Controller('contractors/payments')
@UseGuards(new AuthGuard('contractors_payments'))
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('')
  getAll(@Query(new ZodPiPe(getAllPaymentsSchema)) query) {
    return this.paymentsService.getAll(query);
  }

  @Post('')
  create(@Body(new ZodPiPe(createPaymentSchema)) body) {
    return this.paymentsService.create(body);
  }

  @Get('download')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="pago-contratista.pdf"')
  download(@Query(new ZodPiPe(idObjectSchema)) params) {
    return this.paymentsService.download(params);
  }

  @Get('deliveries-for-payment')
  getDeliveriesForPayment(
    @Query(new ZodPiPe(getDeliveriesForPaymentSchema)) query,
  ) {
    return this.paymentsService.getDeliveriesForPayment(query);
  }

  @Delete('')
  delete(@Body(new ZodPiPe(idObjectSchema)) body) {
    return this.paymentsService.delete(body);
  }
}
