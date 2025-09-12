import { Controller, UseGuards, Get, Query, Header } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import {
  generateUlineRoundSchema,
  generateUlineSchema,
  generateZenpetSchema,
} from './tools.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Tools')
@Controller('resources/tools')
@UseGuards(new AuthGuard('directory'))
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get('zenpet')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="zenpet-labels.pdf"')
  generateZenpet(@Query(new ZodPiPe(generateZenpetSchema)) query) {
    return this.toolsService.generateZenpet(query);
  }

  @Get('uline')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="uline-labels.pdf"')
  generateUline(@Query(new ZodPiPe(generateUlineSchema)) query) {
    return this.toolsService.generateUline(query);
  }

  @Get('uline-round')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="uline-round-labels.pdf"')
  generateUlineRound(@Query(new ZodPiPe(generateUlineRoundSchema)) query) {
    return this.toolsService.generateUlineRound(query);
  }
}
