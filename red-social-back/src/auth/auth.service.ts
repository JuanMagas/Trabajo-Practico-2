import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PasswordHasher } from '@nestjs/authentication';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { UsuarioDocument } from '../usuarios/entities/usuario.entity.js';
import { Ingreso } from './entities/ingreso.entity.js';
import { PayloadToken } from './guards/sesion.guard.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
    @InjectModel(Ingreso.name) private readonly ingresoModel: Model<Ingreso>,
  ) {}

  async registro(datos: RegistroDto) {
    const usuario = await this.usuariosService.crear(datos);
    return { usuario, token: await this.generarToken(usuario) };
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

    await this.ingresoModel.create({ usuario: usuario._id });

    return { usuario, token: await this.generarToken(usuario) };
  }

  // El SesionGuard ya validó el token y buscó al usuario
  autorizar(usuario: UsuarioDocument) {
    return { usuario };
  }

  async refrescar(usuario: UsuarioDocument) {
    return { token: await this.generarToken(usuario) };
  }

  private generarToken(usuario: UsuarioDocument) {
    const payload: PayloadToken = {
      sub: usuario._id.toString(),
      username: usuario.username,
      perfil: usuario.perfil,
    };
    return this.jwtService.signAsync(payload);
  }
}