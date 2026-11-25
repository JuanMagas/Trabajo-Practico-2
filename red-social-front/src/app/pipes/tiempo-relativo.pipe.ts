import { Pipe, PipeTransform } from '@angular/core';

// "2026-11-24T22:10:00Z" -> "hace 5 min", "hace 3 horas", "ayer", "12 nov."
@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  transform(fecha: string | Date | null | undefined): string {
    if (!fecha) {
      return '';
    }
    const momento = new Date(fecha);
    const segundos = Math.floor((Date.now() - momento.getTime()) / 1000);

    if (segundos < 60) return 'recién';
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return horas === 1 ? 'hace 1 hora' : `hace ${horas} horas`;
    const dias = Math.floor(horas / 24);
    if (dias === 1) return 'ayer';
    if (dias < 7) return `hace ${dias} días`;

    return momento.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}