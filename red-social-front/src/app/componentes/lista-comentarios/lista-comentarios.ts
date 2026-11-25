import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComentarioItem } from '../comentario/comentario';
import { Spinner } from '../spinner/spinner';
import { Comentario } from '../../modelos/comentario';
import { ComentariosApi } from '../../servicios/comentarios';
import { mensajeDeError } from '../../utilidades/errores';
import { AutoAlturaDirective } from '../../directivas/auto-altura.directive';
import { AutofocoDirective } from '../../directivas/autofoco.directive';

@Component({
  imports: [ReactiveFormsModule, ComentarioItem, Spinner, AutoAlturaDirective, AutofocoDirective],
  selector: 'app-lista-comentarios',
  styleUrl: './lista-comentarios.css',
  templateUrl: './lista-comentarios.html',
})
export class ListaComentarios implements OnInit {
  private api = inject(ComentariosApi);

  publicacionId = input.required<string>();
  porPagina = input(5);
  permitirComentar = input(true);

  comentarios = signal<Comentario[]>([]);
  total = signal(0);
  cargando = signal(true);
  cargandoMas = signal(false);
  error = signal<string | null>(null);

  // Un FormGroup (aunque tenga un solo campo) para poder usar (ngSubmit) en el <form>
  formulario = new FormGroup({
    mensaje: new FormControl('', [Validators.required, Validators.maxLength(500)]),
  });
  enviando = signal(false);
  errorEnvio = signal<string | null>(null);

  ngOnInit() {
    this.api.listar(this.publicacionId(), 0, this.porPagina()).subscribe({
      next: ({ comentarios, total }) => {
        this.comentarios.set(comentarios);
        this.total.set(total);
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(mensajeDeError(error));
        this.cargando.set(false);
      },
    });
  }

  // Trae la siguiente tanda y la agrega debajo, sin perder las anteriores
  cargarMas() {
    this.cargandoMas.set(true);
    this.api.listar(this.publicacionId(), this.comentarios().length, this.porPagina()).subscribe({
      next: ({ comentarios, total }) => {
        this.comentarios.update((actuales) => [...actuales, ...comentarios]);
        this.total.set(total);
        this.cargandoMas.set(false);
      },
      error: (error) => {
        this.error.set(mensajeDeError(error));
        this.cargandoMas.set(false);
      },
    });
  }

  comentar() {
    const mensaje = this.formulario.controls.mensaje.value?.trim() ?? '';
    if (!mensaje) {
      this.errorEnvio.set('Escribí algo antes de comentar.');
      return;
    }
    this.errorEnvio.set(null);
    this.enviando.set(true);
    this.api.crear(this.publicacionId(), mensaje).subscribe({
      next: (comentario) => {
        // El nuevo va arriba: los más recientes primero
        this.comentarios.update((actuales) => [comentario, ...actuales]);
        this.total.update((t) => t + 1);
        this.formulario.reset();
        this.enviando.set(false);
      },
      error: (error) => {
        this.errorEnvio.set(mensajeDeError(error));
        this.enviando.set(false);
      },
    });
  }

  reemplazar(editado: Comentario) {
    this.comentarios.update((actuales) => actuales.map((c) => (c._id === editado._id ? editado : c)));
  }
}