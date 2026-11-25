import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Modal } from '../modal/modal';
import { Publicacion } from '../../modelos/publicacion';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo.pipe';
import { PublicacionesApi } from '../../servicios/publicaciones';
import { Sesion } from '../../servicios/sesion';
import { mensajeDeError } from '../../utilidades/errores';

@Component({
  imports: [Modal, TiempoRelativoPipe],
  selector: 'app-tarjeta-publicacion',
  styleUrl: './tarjeta-publicacion.css',
  templateUrl: './tarjeta-publicacion.html',
})
export class TarjetaPublicacion {
  private api = inject(PublicacionesApi);
  private sesion = inject(Sesion);

  publicacion = input.required<Publicacion>();
  eliminada = output<string>();

  // Copia local del estado de me gusta: se actualiza al instante al tocar el botón
  private estadoLocal = signal<{ cantidad: number; yo: boolean } | null>(null);
  cantidadMeGusta = computed(() => this.estadoLocal()?.cantidad ?? this.publicacion().cantidadMeGusta);
  meGustaYo = computed(() => this.estadoLocal()?.yo ?? this.publicacion().meGustaYo);

  procesandoMeGusta = signal(false);
  confirmandoBaja = signal(false);
  eliminando = signal(false);
  error = signal<string | null>(null);

  // Puede borrar el autor o un administrador
  puedeEliminar = computed(() => {
    const usuario = this.sesion.usuario();
    return !!usuario && (usuario._id === this.publicacion().autor._id || usuario.perfil === 'administrador');
  });

  iniciales = computed(() => {
    const autor = this.publicacion().autor;
    return `${autor.nombre[0] ?? ''}${autor.apellido[0] ?? ''}`;
  });

  alternarMeGusta() {
    if (this.procesandoMeGusta()) {
      return;
    }
    const yaLeGusta = this.meGustaYo();
    const pedido = yaLeGusta
      ? this.api.quitarMeGusta(this.publicacion()._id)
      : this.api.darMeGusta(this.publicacion()._id);

    this.procesandoMeGusta.set(true);
    pedido.subscribe({
      next: (estado) => {
        this.estadoLocal.set({ cantidad: estado.cantidadMeGusta, yo: estado.meGustaYo });
        this.procesandoMeGusta.set(false);
      },
      error: (error) => {
        this.procesandoMeGusta.set(false);
        this.error.set(mensajeDeError(error));
      },
    });
  }

  eliminar() {
    this.eliminando.set(true);
    this.api.eliminar(this.publicacion()._id).subscribe({
      next: () => {
        this.confirmandoBaja.set(false);
        this.eliminada.emit(this.publicacion()._id);
      },
      error: (error) => {
        this.eliminando.set(false);
        this.confirmandoBaja.set(false);
        this.error.set(mensajeDeError(error));
      },
    });
  }
}