import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { ZodPiPe } from 'src/interceptors/validation/validation.pipe';
import { deleteSchema, editSchema, registerSchema } from './users.schema';
import { AuthGuard } from 'src/interceptors/auth/authorization.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(new AuthGuard('users'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  get() {
    return this.usersService.findAllUsers();
  }

  @Post('')
  register(@Body(new ZodPiPe(registerSchema)) body) {
    return this.usersService.registerUser(body);
  }

  @Put('')
  edit(@Body(new ZodPiPe(editSchema)) body) {
    return this.usersService.editUser(body);
  }

  @Delete('')
  delete(@Body(new ZodPiPe(deleteSchema)) body) {
    return this.usersService.deleteUser(body);
  }
}
