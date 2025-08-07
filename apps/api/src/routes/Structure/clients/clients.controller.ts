import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { deleteSchema, editSchema, createSchema } from './clients.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Clients')
@Controller('clients-list')
@UseGuards(new AuthGuard('structure'))
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  get() {
    return this.clientsService.findAllClients();
  }

  @Post()
  register(@Body(new ZodPiPe(createSchema)) body) {
    return this.clientsService.createClient(body);
  }

  @Put()
  edit(@Body(new ZodPiPe(editSchema)) body) {
    return this.clientsService.editClient(body);
  }

  @Delete()
  delete(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.clientsService.deleteClient(body);
  }
}
