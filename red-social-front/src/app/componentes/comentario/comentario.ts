import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Comentario } from '../../modelos/comentario';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo.pipe';
import { ComentariosApi } from '../../servicios/comentarios';
import { Sesion } from '../../servicios/sesion';
import { mensajeDeError } from '../../utilidades/errores';
import { AutoAlturaDirective } from '../../directivas/auto-altura.directive';
import { AutofocoDirective } from '../../directivas/autofoco.directive';

@Component({
  imports: [ReactiveFormsModule, TiempoRelativoPipe, AutoAlturaDirective, AutofocoDirective],
  selector: 'app-comentario',
  styleUrl: './comentario.css',
  templateUrl: './comentario.html',
})
export class ComentarioItem {
  private api = inject(ComentariosApi);
  private sesion = inject(Sesion);

  comentario = input.required<Comentario>();
  publicacionId = input.required<string>();
  editado = output<Comentario>();

  editando = signal(false);
  guardando = signal(false);
  error = signal<string | null>(null);
  texto = new FormControl('', [Validators.required, Validators.maxLength(500)]);

  esMio = computed(() => this.sesion.usuario()?._id === this.comentario().autor._id);

  empezarEdicion() {
    this.texto.setValue(this.comentario().mensaje);
    this.error.set(null);
    this.editando.set(true);
  }

  cancelar() {
    this.editando.set(false);
  }

  guardar() {
    const mensaje = this.texto.value?.trim() ?? '';
    if (!mensaje) {
      this.error.set('El comentario no puede estar vacío.');
      return;
    }
    if (mensaje === this.comentario().mensaje) {
      this.editando.set(false);
      return;
    }
    this.guardando.set(true);
    this.api.editar(this.publicacionId(), this.comentario()._id, mensaje).subscribe({
      next: (comentario) => {
        this.guardando.set(false);
        this.editando.set(false);
        this.editado.emit(comentario);
      },
      error: (error) => {
        this.guardando.set(false);
        this.error.set(mensajeDeError(error));
      },
    });
  }
}