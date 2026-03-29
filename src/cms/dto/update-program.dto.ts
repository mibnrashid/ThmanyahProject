import { PartialType } from '@nestjs/swagger';
import { CreateProgramDto } from './create-program.dto';

// PartialType = same fields as CreateProgramDto but all optional (PATCH/PUT update).
export class UpdateProgramDto extends PartialType(CreateProgramDto) {}
