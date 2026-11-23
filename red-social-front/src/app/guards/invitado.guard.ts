import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Sesion } from '../servicios/sesion';

// Login y registro: si ya hay sesión, no tiene sentido mostrarlos
export const invitadoGuard: CanActivateFn = () => {
  const sesion = inject(Sesion);
  const router = inject(Router);
  return sesion.token() ? router.createUrlTree(['/publicaciones']) : true;
};