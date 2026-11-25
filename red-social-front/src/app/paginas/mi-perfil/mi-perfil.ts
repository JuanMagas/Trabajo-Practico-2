import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ListaComentarios } from '../../componentes/lista-comentarios/lista-comentarios';
import { Spinner } from '../../componentes/spinner/spinner';
import { TarjetaPublicacion } from '../../componentes/tarjeta-publicacion/tarjeta-publicacion';
import { Publicacion } from '../../modelos/publicacion';
import { EdadPipe } from '../../pipes/edad.pipe';
import { PublicacionesApi } from '../../servicios/publicaciones';
import { Sesion } from '../../servicios/sesion';
import { mensajeDeError } from '../../utilidades/errores';
import { InicialesPipe } from '../../pipes/iniciales.pipe';

@Component({
  imports: [DatePipe, RouterLink, ListaComentarios, Spinner, TarjetaPublicacion, EdadPipe, InicialesPipe],
  selector: 'app-mi-perfil',
  styleUrl: './mi-perfil.css',
  templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit {
  private api = inject(PublicacionesApi);
  usuario = inject(Sesion).usuario;

  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.cargar();
  }

  // Mis últimas 3 publicaciones
  cargar() {
    const usuario = this.usuario();
    if (!usuario) {
      return;
    }
    this.cargando.set(true);
    this.api.listar({ orden: 'fecha', offset: 0, limit: 3, usuario: usuario._id }).subscribe({
      next: ({ publicaciones, total }) => {
        this.publicaciones.set(publicaciones);
        this.total.set(total);
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(mensajeDeError(error));
        this.cargando.set(false);
      },
    });
  }
}