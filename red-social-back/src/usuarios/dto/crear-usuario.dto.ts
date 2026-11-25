import { IsIn, IsNotEmpty } from 'class-validator';
import { RegistroDto } from '../../auth/dto/registro.dto.js';

// Lo mismo que el registro, más el perfil que elige el administrador
export class CrearUsuarioDto extends RegistroDto {
  @IsIn(['usuario', 'administrador'], { message: 'El perfil debe ser usuario o administrador' })
  @IsNotEmpty({ message: 'El perfil es obligatorio' })
  perfil: string;
}