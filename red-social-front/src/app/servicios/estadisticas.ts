import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  ComentariosPorDia,
  ComentariosPorPublicacion,
  PublicacionesPorUsuario,
} from '../modelos/estadisticas';

// Solo administradores. Las fechas van como "2026-11-24"
@Service()
export class EstadisticasApi {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/estadisticas`;

  publicacionesPorUsuario(desde: string, hasta: string) {
    return this.http.get<PublicacionesPorUsuario[]>(`${this.url}/publicaciones-por-usuario`, {
      params: this.rango(desde, hasta),
    });
  }

  comentariosPorDia(desde: string, hasta: string) {
    return this.http.get<ComentariosPorDia[]>(`${this.url}/comentarios-por-dia`, {
      params: this.rango(desde, hasta),
    });
  }

  comentariosPorPublicacion(desde: string, hasta: string) {
    return this.http.get<ComentariosPorPublicacion[]>(`${this.url}/comentarios-por-publicacion`, {
      params: this.rango(desde, hasta),
    });
  }

  private rango(desde: string, hasta: string) {
    return new HttpParams().set('desde', desde).set('hasta', hasta);
  }
}