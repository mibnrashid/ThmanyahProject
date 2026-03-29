import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DiscoveryService } from './discovery.service';
import { Program } from '../programs/program.entity';
import { parseLimit, parsePage } from '../query-params';

@ApiTags('discovery')
@Controller('programs')
export class DiscoveryController {
  constructor(private readonly discovery: DiscoveryService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search title and description (Postgres full text)' })
  async search(
    @Query('q') q: string,
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
  ): Promise<{ items: Program[]; total: number; page: number; limit: number }> {
    // q is required for /programs/search; return 400 if missing/blank.
    if (!q || !q.trim()) {
      throw new BadRequestException('Query parameter q is required');
    }

    const page = parsePage(pageStr);
    const limit = parseLimit(limitStr);
    const { items, total } = await this.discovery.search(q, page, limit);
    return { items, total, page, limit };
  }

  @Get()
  @ApiOperation({ summary: 'List programs (paginated, optional category & language)' })
  async list(
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
    @Query('category') category?: string,
    @Query('language') language?: string,
  ): Promise<{ items: Program[]; total: number; page: number; limit: number }> {
    const page = parsePage(pageStr);
    const limit = parseLimit(limitStr);
    const { items, total } = await this.discovery.list(page, limit, {
      category,
      language,
    });
    return { items, total, page, limit };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one program' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Program> {
    return this.discovery.findOne(id);
  }
}
