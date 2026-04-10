import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { EmailsService } from './emails.service';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { deleteSchema, editSchema, createSchema } from './emails.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@Controller('emails')
@UseGuards(new AuthGuard('it'))
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Get()
  get() {
    return this.emailsService.findAllEmails();
  }

  @Post()
  register(@Body(new ZodPiPe(createSchema)) body) {
    return this.emailsService.createEmail(body);
  }

  @Put()
  edit(@Body(new ZodPiPe(editSchema)) body) {
    return this.emailsService.editEmail(body);
  }

  @Delete()
  delete(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.emailsService.deleteEmail(body);
  }
}
