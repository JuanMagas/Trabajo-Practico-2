import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestConSesion } from '../guards/sesion.guard.js';

// Devuelve el usuario que el SesionGuard dejó en el request
export const UsuarioActual = createParamDecorator((_dato: unknown, context: ExecutionContext) => {
  return context.switchToHttp().getRequest<RequestConSesion>().usuario;
});