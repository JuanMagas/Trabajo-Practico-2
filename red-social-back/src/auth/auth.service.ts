import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async registro(datos: RegistroDto) {
    const usuario = await this.usuariosService.crear(datos);
    return { usuario };
  }

  async login(datos: LoginDto) {
    const usuario = await this.usuariosService.buscarPorIdentificador(datos.identificador);

    const passwordValida =
      usuario !== null && (await this.passwordHasher.verify(datos.password, usuario.password));

    if (!usuario || !passwordValida) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('Tu cuenta está deshabilitada');
    }

    return { usuario };
  }
}