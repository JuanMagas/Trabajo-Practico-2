import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginacionDto {
  @Min(0, { message: 'El offset no puede ser negativo' })
  @IsInt({ message: 'El offset debe ser un número entero' })
  @Type(() => Number)
  @IsOptional()
  offset: number = 0;

  @Max(50, { message: 'El límite máximo es 50' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Type(() => Number)
  @IsOptional()
  limit: number = 5;
}