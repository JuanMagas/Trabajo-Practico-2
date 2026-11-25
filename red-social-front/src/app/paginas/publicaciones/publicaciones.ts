import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NuevaPublicacion } from '../../componentes/nueva-publicacion/nueva-publicacion';
import { Spinner } from '../../componentes/spinner/spinner';
import { TarjetaPublicacion } from '../../componentes/tarjeta-publicacion/tarjeta-publicacion';
import { OrdenPublicaciones, Publicacion } from '../../modelos/publicacion';
import { PublicacionesApi } from '../../servicios/publicaciones';
import { Sesion } from '../../servicios/sesion';
import { mensajeDeError } from '../../utilidades/errores';
import { InicialesPipe } from '../../pipes/iniciales.pipe';

const POR_PAGINA = 10;

@Component({
  imports: [RouterLink, NuevaPublicacion, Spinner, TarjetaPublicacion, InicialesPipe],
  selector: 'app-publicaciones',
  styleUrl: './publicaciones.css',
  templateUrl: './publicaciones.html',
})
export class Publicaciones implements OnInit {
  private api = inject(PublicacionesApi);
  usuario = inject(Sesion).usuario;

  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);
  pagina = signal(1);
  orden = signal<OrdenPublicaciones>('fecha');
  cargando = signal(true);
  error = signal<string | null>(null);

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / POR_PAGINA)));

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set(null);
    this.api
      .listar({ orden: this.orden(), offset: (this.pagina() - 1) * POR_PAGINA, limit: POR_PAGINA })
      .subscribe({
        next: ({ publicaciones, total }) => {
          // Si se borró la última de una página, se vuelve a la anterior
          if (publicaciones.length === 0 && this.pagina() > 1) {
            this.pagina.update((p) => p - 1);
            this.cargar();
            return;
          }
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

  cambiarOrden(orden: OrdenPublicaciones) {
    if (orden === this.orden()) {
      return;
    }
    this.orden.set(orden);
    this.pagina.set(1);
    this.cargar();
  }

  irAPagina(pagina: number) {
    this.pagina.set(pagina);
    this.cargar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Una publicación nueva aparece primero solo en el orden por fecha
  alPublicar() {
    this.orden.set('fecha');
    this.pagina.set(1);
    this.cargar();
  }

  alEliminar() {
    this.cargar();
  }
}