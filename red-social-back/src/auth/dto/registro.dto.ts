import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegistroDto {
  @MaxLength(50, { message: 'El nombre no puede superar los 50 caracteres' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @MaxLength(50, { message: 'El apellido no puede superar los 50 caracteres' })
  @IsString({ message: 'El apellido debe ser texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @IsEmail({}, { message: 'El correo no tiene un formato válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email: string;

  @Matches(/^[a-zA-Z0-9_.]+$/, { message: 'El nombre de usuario solo puede tener letras, números, punto y guion bajo' })
  @MaxLength(20, { message: 'El nombre de usuario no puede superar los 20 caracteres' })
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @IsString({ message: 'El nombre de usuario debe ser texto' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  username: string;

  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
  })
  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  fechaNacimiento: string;

  @MaxLength(200, { message: 'La descripción no puede superar los 200 caracteres' })
  @IsString({ message: 'La descripción debe ser texto' })
  @IsOptional()
  descripcion?: string;

  fotoPerfil?: string;
}