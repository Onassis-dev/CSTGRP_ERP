import { Controller } from '@nestjs/common';
import { FunctionsService } from './functions.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Functions')
@Controller('functions')
export class FunctionsController {
  constructor(private readonly functionsService: FunctionsService) {}
}
