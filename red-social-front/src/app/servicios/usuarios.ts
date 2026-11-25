import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { Usuario } from '../modelos/usuario';

// Rutas solo para administradores (el back responde 403 a cualquier otro)
@Service()
export class UsuariosApi {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  listar() {
    return this.http.get<Usuario[]>(this.url);
  }

  crear(datos: FormData) {
    return this.http.post<Usuario>(this.url, datos);
  }

  deshabilitar(id: string) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  habilitar(id: string) {
    return this.http.post<void>(`${this.url}/${id}/habilitar`, {});
  }
}