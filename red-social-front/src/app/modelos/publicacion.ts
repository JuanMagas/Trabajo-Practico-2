export interface AutorPublicacion {
  _id: string;
  nombre: string;
  apellido: string;
  username: string;
  fotoPerfil: string;
}

export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  imagen: string;
  autor: AutorPublicacion;
  cantidadMeGusta: number;
  meGustaYo: boolean;
  createdAt: string;
}

export interface ListadoPublicaciones {
  publicaciones: Publicacion[];
  total: number;
}

export interface EstadoMeGusta {
  cantidadMeGusta: number;
  meGustaYo: boolean;
}

export type OrdenPublicaciones = 'fecha' | 'meGusta';