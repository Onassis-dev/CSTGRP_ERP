import { Module } from '@nestjs/common';
import { DirectoryModule } from './directory/directory.module';
import { FormatsModule } from './formats/formats.module';
import { DocsModule } from './docs/docs.module';
import { ToolsModule } from './tools/tools.module';

@Module({
  imports: [DirectoryModule, FormatsModule, DocsModule, ToolsModule],
})
export class ResourcesModule {}
