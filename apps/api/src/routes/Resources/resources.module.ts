import { Module } from '@nestjs/common';
import { DirectoryModule } from './directory/directory.module';
import { FormatsModule } from './formats/formats.module';
import { DocsModule } from './docs/docs.module';

@Module({
  imports: [DirectoryModule, FormatsModule, DocsModule],
})
export class ResourcesModule {}
