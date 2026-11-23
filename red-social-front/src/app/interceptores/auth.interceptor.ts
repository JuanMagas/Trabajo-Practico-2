import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Sesion } from '../servicios/sesion';

// Rutas donde un 401 significa "datos incorrectos" y no "sesión vencida"
const RUTAS_SIN_SESION = ['/auth/login', '/auth/registro'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sesion = inject(Sesion);
  const router = inject(Router);

  // Solo se agrega el token a los pedidos que van a nuestro back (no a Cloudinary, por ejemplo)
  const token = sesion.token();
  const esNuestroBack = req.url.startsWith(environment.apiUrl);
  const pedido =
    token && esNuestroBack ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(pedido).pipe(
    catchError((error: HttpErrorResponse) => {
      const esRutaSinSesion = RUTAS_SIN_SESION.some((ruta) => req.url.endsWith(ruta));
      if (error.status === 401 && esNuestroBack && !esRutaSinSesion) {
        const deshabilitada = error.error?.message === 'Tu cuenta está deshabilitada';
        sesion.cerrar(deshabilitada ? 'Tu cuenta está deshabilitada.' : 'Tu sesión venció. Volvé a entrar.');
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};