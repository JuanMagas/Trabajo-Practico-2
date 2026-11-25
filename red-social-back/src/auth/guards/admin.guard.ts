import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { RequestConSesion } from './sesion.guard.js';

// Va siempre DESPUÉS del SesionGuard: usa el usuario que ese guard dejó en el request
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { usuario } = context.switchToHttp().getRequest<RequestConSesion>();
    if (usuario?.perfil !== 'administrador') {
      throw new ForbiddenException('Solo un administrador puede hacer esto');
    }
    return true;
  }
}