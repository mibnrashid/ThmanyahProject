import { Module } from '@nestjs/common';
import { ProgramsModule } from '../programs/programs.module';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';

@Module({
  imports: [ProgramsModule],
  controllers: [CmsController],
  providers: [CmsService],
})
export class CmsModule {}
