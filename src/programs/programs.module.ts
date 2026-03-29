import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from './program.entity';
import { ProgramRepository } from './program.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Program])],
  // providers = classes Nest can inject; without this, CMS/Discovery can't get ProgramRepository.
  providers: [ProgramRepository],
  // exports = lets other modules (CmsModule/DiscoveryModule) inject ProgramRepository after importing ProgramsModule.
  exports: [ProgramRepository],
})
export class ProgramsModule {}
