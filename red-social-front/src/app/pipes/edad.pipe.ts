import { Pipe, PipeTransform } from '@angular/core';

// "1995-09-12" -> "31 años"
@Pipe({ name: 'edad' })
export class EdadPipe implements PipeTransform {
  transform(fechaNacimiento: string | Date | null | undefined): string {
    if (!fechaNacimiento) {
      return '';
    }
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getUTCFullYear() - nacimiento.getUTCFullYear();
    // Si todavía no cumplió años este año, se resta uno
    const yaCumplio =
      hoy.getUTCMonth() > nacimiento.getUTCMonth() ||
      (hoy.getUTCMonth() === nacimiento.getUTCMonth() && hoy.getUTCDate() >= nacimiento.getUTCDate());
    if (!yaCumplio) {
      edad--;
    }
    return edad === 1 ? '1 año' : `${edad} años`;
  }
}