import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsModule } from './cms/cms.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { Program } from './programs/program.entity';
import { ProgramsModule } from './programs/programs.module';

@Module({
  imports: [
    // ConfigModule loads env vars from .env/.env.local so ConfigService can read DB_HOST, DB_PORT, etc.
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.local'] }),

    // TypeORM connection setup; values come from ConfigService (env), not hardcoded in code.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_DATABASE', 'thmanyah'),
        entities: [Program],
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
        logging: config.get<string>('DB_LOGGING', 'false') === 'true',
      }),
    }),

    // Feature modules: ProgramsModule exports ProgramRepository used by CMS + Discovery.
    ProgramsModule,
    CmsModule,
    DiscoveryModule,
  ],
})
export class AppModule {}
