import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../servicios/auth';
import { Sesion } from '../servicios/sesion';

// Solo deja pasar si hay una sesión válida
export const sesionGuard: CanActivateFn = async () => {
  const sesion = inject(Sesion);
  const auth = inject(Auth);
  const router = inject(Router);

  if (!sesion.token()) {
    return router.createUrlTree(['/login']);
  }
  if (sesion.validada()) {
    return true;
  }

  // Entró directo a una ruta (o recargó): se confirma el token una vez con el back
  try {
    const { usuario } = await firstValueFrom(auth.autorizar());
    sesion.guardarUsuario(usuario);
    sesion.validada.set(true);
    return true;
  } catch {
    // Si fue un 401, el interceptor ya cerró la sesión. Si fue otro error
    // (por ejemplo, el back no responde), se cierra acá para no quedar en un bucle
    if (sesion.token()) {
      sesion.cerrar('No pudimos verificar tu sesión. Volvé a entrar.');
    }
    return router.createUrlTree(['/login']);
  }
};