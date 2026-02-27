import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';
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

  @Get('birthdays')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="cumpleanos-del-mes.pdf"')
  getBirthdaysPdf(@Query() query: { date: string }) {
    return this.employeesService.generateBirthdaysList(query);
  }

  @Get('employeesnamespdf')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename="empleados.pdf"')
  getEmployeesPdf() {
    return this.employeesService.generateEmployeesNamesPdf();
  }
}
