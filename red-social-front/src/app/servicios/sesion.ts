import { Service, signal } from '@angular/core';
import { Usuario } from '../modelos/usuario';

const CLAVE_USUARIO = 'clutch-usuario';
const CLAVE_TOKEN = 'clutch-token';
const AVISO_ANTES_DE_VENCER = 5 * 60 * 1000; // 5 minutos

@Service()
export class Sesion {
  usuario = signal<Usuario | null>(this.leerUsuario());
  token = signal<string | null>(localStorage.getItem(CLAVE_TOKEN));

  // true cuando ya se confirmó con el back que el token es válido
  validada = signal(false);

  // true cuando faltan 5 minutos para que venza el token
  avisoVencimiento = signal(false);

  // Mensaje para mostrar en el login cuando la sesión se cerró sola
  motivoCierre = signal<string | null>(null);

  private temporizador?: ReturnType<typeof setTimeout>;

  constructor() {
    const token = this.token();
    if (token) {
      this.programarAviso(token);
    }
  }

  iniciar(usuario: Usuario, token: string) {
    this.guardarUsuario(usuario);
    this.actualizarToken(token);
    this.validada.set(true);
    this.motivoCierre.set(null);
  }

  guardarUsuario(usuario: Usuario) {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    this.usuario.set(usuario);
  }

  actualizarToken(token: string) {
    localStorage.setItem(CLAVE_TOKEN, token);
    this.token.set(token);
    this.avisoVencimiento.set(false);
    this.programarAviso(token);
  }

  cerrar(motivo: string | null = null) {
    localStorage.removeItem(CLAVE_USUARIO);
    localStorage.removeItem(CLAVE_TOKEN);
    this.usuario.set(null);
    this.token.set(null);
    this.validada.set(false);
    this.avisoVencimiento.set(false);
    this.motivoCierre.set(motivo);
    clearTimeout(this.temporizador);
  }

  // El token dura 15 minutos: el aviso aparece 5 minutos antes de que venza.
  // Se calcula con la fecha de vencimiento que trae el propio token,
  // así funciona igual si el usuario recarga la página.
  private programarAviso(token: string) {
    clearTimeout(this.temporizador);
    const vence = this.leerVencimiento(token);
    if (!vence) {
      return;
    }
    const espera = vence - AVISO_ANTES_DE_VENCER - Date.now();
    this.temporizador = setTimeout(() => this.avisoVencimiento.set(true), Math.max(espera, 0));
  }

  // Un JWT son tres partes separadas por puntos; la del medio es el payload en base64
  private leerVencimiento(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.exp * 1000;
    } catch {
      return null;
    }
  }

  private leerUsuario(): Usuario | null {
    const guardado = localStorage.getItem(CLAVE_USUARIO);
    return guardado ? JSON.parse(guardado) : null;
  }
}