import { IsDateString, IsNotEmpty } from 'class-validator';

// ?desde=2026-11-01&hasta=2026-11-30 (los dos días incluidos)
export class RangoFechasDto {
  @IsDateString({}, { message: 'La fecha "desde" no es válida' })
  @IsNotEmpty({ message: 'Falta la fecha "desde"' })
  desde: string;

  @IsDateString({}, { message: 'La fecha "hasta" no es válida' })
  @IsNotEmpty({ message: 'Falta la fecha "hasta"' })
  hasta: string;
}