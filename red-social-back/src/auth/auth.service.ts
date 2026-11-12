import { Injectable } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { RegistroDto } from './dto/registro.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async registro(datos: RegistroDto) {
    const usuario = await this.usuariosService.crear(datos);
    return { usuario };
  }
}