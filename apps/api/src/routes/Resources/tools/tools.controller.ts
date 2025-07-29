import { Controller, Body, UseGuards, Post } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { generateZenpetSchema } from './tools.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Tools')
@Controller('resources/tools')
@UseGuards(new AuthGuard())
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post('zenpet')
  register(@Body(new ZodPiPe(generateZenpetSchema)) body) {
    return this.toolsService.generateZenpet(body);
  }
}
