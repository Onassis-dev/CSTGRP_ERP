import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { VariousService } from './various.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('HR Various')
@Controller('hrvarious')
@UseGuards(new AuthGuard())
export class VariousController {
  constructor(private readonly employeesService: VariousService) {}

  @Get('areas')
  getAreas() {
    return this.employeesService.getAreas();
  }

  @Get('assistance-areas')
  getAssistanceAreas() {
    return this.employeesService.getAssistanceAreas();
  }

  @Get('positions')
  getPositions() {
    return this.employeesService.getPositions();
  }

  @Get('incidences')
  getIncidences() {
    return this.employeesService.getIncidences();
  }

  @Get('birthdayphoto')
  getBorthdayPhoto(@Query() query) {
    return this.employeesService.generateImage(query);
  }
}
