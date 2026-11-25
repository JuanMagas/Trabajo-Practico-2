import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Sesion } from '../servicios/sesion';

// Corre después del sesionGuard (está en una ruta hija), así que el usuario ya está cargado
export const adminGuard: CanActivateFn = () => {
  const sesion = inject(Sesion);
  const router = inject(Router);

  if (sesion.usuario()?.perfil === 'administrador') {
    return true;
  }
  return router.createUrlTree(['/publicaciones']);
};