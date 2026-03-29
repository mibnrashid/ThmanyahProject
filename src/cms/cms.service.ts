import { Injectable, NotFoundException } from '@nestjs/common';
import { ProgramRepository } from '../programs/program.repository';
import { Program } from '../programs/program.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class CmsService {
  constructor(private readonly programs: ProgramRepository) {}

  async create(dto: CreateProgramDto): Promise<Program> {
    // DTO is validated in main.ts (ValidationPipe); repository handles DB writes.
    const entity = this.programs.create({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      language: dto.language,
      duration: dto.duration,
      publishDate: dto.publishDate,
    });
    return this.programs.save(entity);
  }

  async findAll(page: number, limit: number) {
    return this.programs.findAllForCms(page, limit);
  }

  async findOne(id: string): Promise<Program> {
    const p = await this.programs.findById(id);
    if (!p) {
      throw new NotFoundException(`Program ${id} not found`);
    }
    return p;
  }

  async update(id: string, dto: UpdateProgramDto): Promise<Program> {
    // Only overwrite fields that are present in the DTO.
    const existing = await this.findOne(id);
    if (dto.title !== undefined) existing.title = dto.title;
    if (dto.description !== undefined) existing.description = dto.description;
    if (dto.category !== undefined) existing.category = dto.category;
    if (dto.language !== undefined) existing.language = dto.language;
    if (dto.duration !== undefined) existing.duration = dto.duration;
    if (dto.publishDate !== undefined) existing.publishDate = dto.publishDate;
    return this.programs.save(existing);
  }

  async remove(id: string): Promise<void> {
    const p = await this.findOne(id);
    await this.programs.remove(p);
  }
}
