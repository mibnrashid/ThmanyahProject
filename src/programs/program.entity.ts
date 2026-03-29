import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('programs')
export class Program {
  // UUID = unique id string (safer than 1,2,3 in URLs).
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // These fields become columns in the `programs` table.
  @Column({ type: 'varchar', length: 512 })
  title: string;

  // Longer text description.
  @Column({ type: 'text' })
  description: string;

  // Category label.
  @Column({ type: 'varchar', length: 256 })
  category: string;

  // Language label/code.
  @Column({ type: 'varchar', length: 32 })
  language: string;

  // Duration in seconds.
  @Column({ type: 'int' })
  duration: number;

  // Stored as DATE in Postgres (no time), kept as string for API input/output.
  @Column({ type: 'date' })
  publishDate: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
