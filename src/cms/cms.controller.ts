import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { Program } from '../programs/program.entity';
import { parseLimit, parsePage } from '../query-params';

@ApiTags('cms')
@Controller('cms/programs')
export class CmsController {
  constructor(private readonly cms: CmsService) {}

  @Post()
  @ApiOperation({ summary: 'Create program' })
  async create(@Body() dto: CreateProgramDto): Promise<Program> {
    return this.cms.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List programs (paginated)' })
  async list(
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
  ): Promise<{ items: Program[]; total: number; page: number; limit: number }> {
    const page = parsePage(pageStr);
    const limit = parseLimit(limitStr);
    const { items, total } = await this.cms.findAll(page, limit);
    return { items, total, page, limit };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one program' })
  async getOne(@Param('id', ParseUUIDPipe) id: string): Promise<Program> {
    return this.cms.findOne(id);
  }

  @Patch(':id')
  @Put(':id')
  @ApiOperation({ summary: 'Update program (PATCH or PUT; only send fields to change)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProgramDto,
  ): Promise<Program> {
    return this.cms.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete program' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.cms.remove(id);
  }
}
