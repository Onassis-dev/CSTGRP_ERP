import { Module } from '@nestjs/common';
import { EmailsModule } from './emails/emails.module';
import { ComputersModule } from './computers/computers.module';
import { DevicesModule } from './devices/devices.module';

@Module({
  imports: [EmailsModule, ComputersModule, DevicesModule],
})
export class ITModule {}
