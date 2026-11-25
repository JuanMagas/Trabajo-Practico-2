import { Pipe, PipeTransform } from '@angular/core';

// { nombre: 'Juan', apellido: 'Magas' } -> "JM" (para el avatar de quien no tiene foto)
@Pipe({ name: 'iniciales' })
export class InicialesPipe implements PipeTransform {
  transform(persona: { nombre?: string; apellido?: string } | null | undefined): string {
    if (!persona) {
      return '';
    }
    const primera = (texto?: string) => texto?.trim().charAt(0).toUpperCase() ?? '';
    return primera(persona.nombre) + primera(persona.apellido);
  }
}