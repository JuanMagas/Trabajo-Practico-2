import { Service, signal } from '@angular/core';
import { Usuario } from '../modelos/usuario';

const CLAVE = 'clutch-usuario';

@Service()
export class Sesion {
  // Se lee una sola vez al iniciar la app, por si ya había una sesión guardada
  usuario = signal<Usuario | null>(this.leerGuardado());

  iniciar(usuario: Usuario) {
    localStorage.setItem(CLAVE, JSON.stringify(usuario));
    this.usuario.set(usuario);
  }

  cerrar() {
    localStorage.removeItem(CLAVE);
    this.usuario.set(null);
  }

  private leerGuardado(): Usuario | null {
    const guardado = localStorage.getItem(CLAVE);
    return guardado ? JSON.parse(guardado) : null;
  }
}