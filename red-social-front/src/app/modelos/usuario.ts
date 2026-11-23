export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  fechaNacimiento: string;
  descripcion: string;
  fotoPerfil: string;
  perfil: 'usuario' | 'administrador';
  activo: boolean;
  createdAt: string;
}

export interface RespuestaAuth {
  usuario: Usuario;
  token: string;
}