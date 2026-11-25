import { AutorPublicacion } from './publicacion';

export interface Comentario {
  _id: string;
  mensaje: string;
  autor: AutorPublicacion;
  modificado: boolean;
  createdAt: string;
}

export interface ListadoComentarios {
  comentarios: Comentario[];
  total: number;
}