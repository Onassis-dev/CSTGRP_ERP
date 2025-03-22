import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import sql from 'src/utils/db';

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  @Get('directory')
  async directory() {
    return await sql`select 
    (select name from employees where id = directory."employeeId") as name,
     (select email from emails where id = directory."emailId") as email ,
     (select name from positions where id = (select "positionId" from employees where id = directory."employeeId")) as position,
     extension
     from directory`;
  }
}
