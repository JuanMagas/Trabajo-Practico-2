import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'El usuario o correo debe ser texto' })
  @IsNotEmpty({ message: 'El usuario o correo es obligatorio' })
  identificador: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}