import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  EstadoMeGusta,
  ListadoPublicaciones,
  OrdenPublicaciones,
  Publicacion,
} from '../modelos/publicacion';

export interface FiltrosPublicaciones {
  orden: OrdenPublicaciones;
  offset: number;
  limit: number;
  usuario?: string;
}

@Service()
export class PublicacionesApi {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/publicaciones`;

  listar(filtros: FiltrosPublicaciones) {
    let params = new HttpParams()
      .set('orden', filtros.orden)
      .set('offset', filtros.offset)
      .set('limit', filtros.limit);
    if (filtros.usuario) {
      params = params.set('usuario', filtros.usuario);
    }
    return this.http.get<ListadoPublicaciones>(this.url, { params });
  }

  obtener(id: string) {
    return this.http.get<Publicacion>(`${this.url}/${id}`);
  }

  crear(datos: FormData) {
    return this.http.post<Publicacion>(this.url, datos);
  }

  eliminar(id: string) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  darMeGusta(id: string) {
    return this.http.post<EstadoMeGusta>(`${this.url}/${id}/me-gusta`, {});
  }

  quitarMeGusta(id: string) {
    return this.http.delete<EstadoMeGusta>(`${this.url}/${id}/me-gusta`);
  }
}