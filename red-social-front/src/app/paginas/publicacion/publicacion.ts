import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ListaComentarios } from '../../componentes/lista-comentarios/lista-comentarios';
import { Spinner } from '../../componentes/spinner/spinner';
import { TarjetaPublicacion } from '../../componentes/tarjeta-publicacion/tarjeta-publicacion';
import { Publicacion as PublicacionModelo } from '../../modelos/publicacion';
import { PublicacionesApi } from '../../servicios/publicaciones';
import { mensajeDeError } from '../../utilidades/errores';

@Component({
  imports: [RouterLink, ListaComentarios, Spinner, TarjetaPublicacion],
  selector: 'app-publicacion',
  styleUrl: './publicacion.css',
  templateUrl: './publicacion.html',
})
export class Publicacion implements OnInit {
  private api = inject(PublicacionesApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  publicacion = signal<PublicacionModelo | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.api.obtener(id).subscribe({
      next: (publicacion) => {
        this.publicacion.set(publicacion);
        this.cargando.set(false);
      },
      error: (error) => {
        // 400 = id mal formado, 404 = no existe o fue eliminada: para el usuario es lo mismo
        const noExiste = error.status === 400 || error.status === 404;
        this.error.set(noExiste ? 'El enlace no es válido o la publicación fue eliminada.' : mensajeDeError(error));
        this.cargando.set(false);
      },
    });
  }

  // Si la borra desde acá, vuelve al listado
  alEliminar() {
    this.router.navigateByUrl('/publicaciones');
  }
}