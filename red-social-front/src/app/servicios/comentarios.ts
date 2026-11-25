import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { Comentario, ListadoComentarios } from '../modelos/comentario';

@Service()
export class ComentariosApi {
  private http = inject(HttpClient);

  private url(publicacionId: string) {
    return `${environment.apiUrl}/publicaciones/${publicacionId}/comentarios`;
  }

  listar(publicacionId: string, offset: number, limit: number) {
    const params = new HttpParams().set('offset', offset).set('limit', limit);
    return this.http.get<ListadoComentarios>(this.url(publicacionId), { params });
  }

  crear(publicacionId: string, mensaje: string) {
    return this.http.post<Comentario>(this.url(publicacionId), { mensaje });
  }

  editar(publicacionId: string, comentarioId: string, mensaje: string) {
    return this.http.put<Comentario>(`${this.url(publicacionId)}/${comentarioId}`, { mensaje });
  }
}