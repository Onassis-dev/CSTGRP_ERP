import { Module } from '@nestjs/common';
import { DirectoryModule } from './directory/directory.module';
import { FormatsModule } from './formats/formats.module';

@Module({
  imports: [DirectoryModule, FormatsModule],
})
export class ResourcesModule {}
