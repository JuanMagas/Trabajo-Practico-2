import { Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from '../modal/modal';
import { Publicacion } from '../../modelos/publicacion';
import { PublicacionesApi } from '../../servicios/publicaciones';
import { mensajeDeError } from '../../utilidades/errores';
import { AutoAlturaDirective } from '../../directivas/auto-altura.directive';
import { AutofocoDirective } from '../../directivas/autofoco.directive';
import { MostrarClaveDirective } from '../../directivas/mostrar-clave.directive';

const TAMANIO_MAXIMO_IMAGEN = 4 * 1024 * 1024; // 4 MB, igual que el back

@Component({
  imports: [ReactiveFormsModule, Modal, AutoAlturaDirective, AutofocoDirective, MostrarClaveDirective],
  selector: 'app-nueva-publicacion',
  styleUrl: './nueva-publicacion.css',
  templateUrl: './nueva-publicacion.html',
})
export class NuevaPublicacion {
  private api = inject(PublicacionesApi);

  publicada = output<Publicacion>();

  formulario = new FormGroup({
    titulo: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    mensaje: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
  });

  imagen = signal<File | null>(null);
  previsualizacion = signal<string | null>(null);
  errorImagen = signal<string | null>(null);
  enviando = signal(false);
  errorEnvio = signal<string | null>(null);

  error(campo: 'titulo' | 'mensaje'): string | null {
    const control = this.formulario.controls[campo];
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.errors['required']) {
      return campo === 'titulo' ? 'Poné un título.' : 'Escribí un mensaje.';
    }
    if (control.errors['maxlength']) {
      return `No puede superar los ${control.errors['maxlength'].requiredLength} caracteres.`;
    }
    return 'El valor no es válido.';
  }

  elegirImagen(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    input.value = ''; // permite volver a elegir el mismo archivo
    this.errorImagen.set(null);

    if (!archivo) {
      return;
    }
    if (!archivo.type.startsWith('image/')) {
      this.errorImagen.set('El archivo tiene que ser una imagen.');
      return;
    }
    if (archivo.size > TAMANIO_MAXIMO_IMAGEN) {
      this.errorImagen.set('La imagen no puede pesar más de 4 MB.');
      return;
    }
    this.quitarImagen();
    this.imagen.set(archivo);
    this.previsualizacion.set(URL.createObjectURL(archivo));
  }

  quitarImagen() {
    const anterior = this.previsualizacion();
    if (anterior) {
      URL.revokeObjectURL(anterior);
    }
    this.imagen.set(null);
    this.previsualizacion.set(null);
  }

  enviar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { titulo, mensaje } = this.formulario.getRawValue();
    const datos = new FormData();
    datos.append('titulo', titulo ?? '');
    datos.append('mensaje', mensaje ?? '');
    const imagen = this.imagen();
    if (imagen) {
      datos.append('imagen', imagen);
    }

    this.enviando.set(true);
    this.api.crear(datos).subscribe({
      next: (publicacion) => {
        this.enviando.set(false);
        this.formulario.reset();
        this.quitarImagen();
        this.publicada.emit(publicacion);
      },
      error: (error) => {
        this.enviando.set(false);
        this.errorEnvio.set(mensajeDeError(error));
      },
    });
  }
}