import { HttpErrorResponse } from '@angular/common/http';

// Convierte un error del back en un mensaje para mostrar al usuario
export function mensajeDeError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado. Probá de nuevo.';
  }
  if (error.status === 0) {
    return 'No pudimos conectarnos con el servidor. Revisá tu conexión y probá de nuevo.';
  }
  const mensaje = error.error?.message;
  if (Array.isArray(mensaje)) {
    return mensaje.join(' ');
  }
  if (typeof mensaje === 'string') {
    return mensaje;
  }
  return 'Ocurrió un error inesperado. Probá de nuevo.';
}