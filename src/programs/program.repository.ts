import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Program } from './program.entity';

// Optional filters for public discovery listing.
export interface ProgramListFilters {
  category?: string;
  language?: string;
}

@Injectable()
export class ProgramRepository {
  constructor(
    @InjectRepository(Program)
    private readonly orm: Repository<Program>,
  ) {}

  // create() builds an object in memory; save() is what actually hits Postgres.
  create(data: Partial<Program>): Program {
    return this.orm.create(data);
  }

  // Returns Promise<Program> because DB work is async (needs await).
  async save(entity: Program): Promise<Program> {
    return this.orm.save(entity);
  }

  // Returns null if the UUID doesn't exist; services turn that into HTTP 404.
  async findById(id: string): Promise<Program | null> {
    return this.orm.findOne({ where: { id } });
  }

  // Promise<void> because delete succeeds or throws; no "deleted object" returned.
  async remove(entity: Program): Promise<void> {
    await this.orm.remove(entity);
  }

  // Pagination: skip = offset, take = limit; returns items + total for UI paging.
  async findAllPaginated(
    page: number,
    limit: number,
    filters: ProgramListFilters,
  ): Promise<{ items: Program[]; total: number }> {
    const qb = this.orm.createQueryBuilder('p');
    this.applyListFilters(qb, filters);
    qb.orderBy('p.publishDate', 'DESC').addOrderBy('p.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  // Full‑text search uses Postgres `to_tsvector(...) @@ plainto_tsquery(...)`.
  async searchFullText(
    q: string,
    page: number,
    limit: number,
  ): Promise<{ items: Program[]; total: number }> {
    const trimmed = q.trim();
    if (!trimmed) {
      return { items: [], total: 0 };
    }

    const base = this.orm
      .createQueryBuilder('p')
      .where(
        `to_tsvector('simple', p.title || ' ' || p.description) @@ plainto_tsquery('simple', :q)`,
        { q: trimmed },
      )
      .orderBy('p.publishDate', 'DESC');

    // clone() keeps the count query separate from the paged items query.
    const total = await base.clone().getCount();
    const items = await base
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { items, total };
  }

  // CMS list: ordered by updatedAt so editors see recently changed programs first.
  async findAllForCms(
    page: number,
    limit: number,
  ): Promise<{ items: Program[]; total: number }> {
    const [items, total] = await this.orm.findAndCount({
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  // Query params are strings; parameter binding (':category') avoids SQL injection.
  private applyListFilters(
    qb: SelectQueryBuilder<Program>,
    filters: ProgramListFilters,
  ): void {
    if (filters.category) {
      qb.andWhere('p.category = :category', { category: filters.category });
    }
    if (filters.language) {
      qb.andWhere('p.language = :language', { language: filters.language });
    }
  }
}
