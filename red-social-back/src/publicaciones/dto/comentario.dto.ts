import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Sirve para crear y para editar: en los dos casos solo se manda el mensaje
export class ComentarioDto {
  @MaxLength(500, { message: 'El comentario no puede superar los 500 caracteres' })
  @IsString({ message: 'El comentario debe ser texto' })
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  mensaje: string;
}