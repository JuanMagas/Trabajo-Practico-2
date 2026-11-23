import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsuariosService } from '../../usuarios/usuarios.service.js';
import { UsuarioDocument } from '../../usuarios/entities/usuario.entity.js';

export interface PayloadToken {
  sub: string;
  username: string;
  perfil: string;
}

// El request después de pasar por el guard: trae el usuario que hizo el pedido
export interface RequestConSesion extends Request {
  usuario: UsuarioDocument;
}

@Injectable()
export class SesionGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestConSesion>();
    const token = this.extraerToken(request);

    if (!token) {
      throw new UnauthorizedException('Falta el token de sesión');
    }

    let payload: PayloadToken;
    try {
      payload = await this.jwtService.verifyAsync<PayloadToken>(token);
    } catch {
      throw new UnauthorizedException('La sesión venció o el token no es válido');
    }

    // Se lee el usuario de la base en cada pedido: si un admin lo deshabilitó
    // o le cambió el perfil, se aplica en el momento, sin esperar a que venza el token
    const usuario = await this.usuariosService.buscarPorId(payload.sub);
    if (!usuario) {
      throw new UnauthorizedException('El usuario ya no existe');
    }
    if (!usuario.activo) {
      throw new UnauthorizedException('Tu cuenta está deshabilitada');
    }

    request.usuario = usuario;
    return true;
  }

  // "Authorization: Bearer <token>" -> "<token>"
  private extraerToken(request: Request): string | null {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' && token ? token : null;
  }
}