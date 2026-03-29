import { Injectable, NotFoundException } from '@nestjs/common';
import { ProgramRepository } from '../programs/program.repository';
import { Program } from '../programs/program.entity';

@Injectable()
export class DiscoveryService {
  constructor(private readonly programs: ProgramRepository) {}

  async list(
    page: number,
    limit: number,
    filters: { category?: string; language?: string },
  ) {
    return this.programs.findAllPaginated(page, limit, filters);
  }

  async findOne(id: string): Promise<Program> {
    const p = await this.programs.findById(id);
    if (!p) {
      throw new NotFoundException(`Program ${id} not found`);
    }
    return p;
  }

  async search(q: string, page: number, limit: number) {
    return this.programs.searchFullText(q, page, limit);
  }
}
