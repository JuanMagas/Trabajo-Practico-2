import { Type } from 'class-transformer';
import { IsIn, IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

// Parámetros de la URL: /publicaciones?orden=meGusta&usuario=<id>&offset=0&limit=10
export class ListarPublicacionesDto {
  @IsIn(['fecha', 'meGusta'], { message: 'El orden debe ser "fecha" o "meGusta"' })
  @IsOptional()
  orden: 'fecha' | 'meGusta' = 'fecha';

  @IsMongoId({ message: 'El usuario no es un id válido' })
  @IsOptional()
  usuario?: string;

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
  limit: number = 10;
}