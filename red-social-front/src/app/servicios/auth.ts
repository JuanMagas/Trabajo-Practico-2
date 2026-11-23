import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { RespuestaAuth, Usuario } from '../modelos/usuario';

@Service()
export class Auth {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auth`;

  registro(datos: FormData) {
    return this.http.post<RespuestaAuth>(`${this.url}/registro`, datos);
  }

  login(identificador: string, password: string) {
    return this.http.post<RespuestaAuth>(`${this.url}/login`, { identificador, password });
  }

   // El token lo agrega el interceptor
  autorizar() {
    return this.http.post<{ usuario: Usuario }>(`${this.url}/autorizar`, {});
  }

  refrescar() {
    return this.http.post<{ token: string }>(`${this.url}/refrescar`, {});
  }

  disponible(campo: 'email' | 'username', valor: string) {
    return this.http.get<{ disponible: boolean }>(
      `${this.url}/disponible/${campo}/${encodeURIComponent(valor)}`,
    );
  }
}