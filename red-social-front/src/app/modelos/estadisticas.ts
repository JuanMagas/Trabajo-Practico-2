export interface PublicacionesPorUsuario {
  username: string;
  cantidad: number;
}

export interface ComentariosPorDia {
  fecha: string; // "2026-11-24"
  cantidad: number;
}

export interface ComentariosPorPublicacion {
  publicacionId: string;
  titulo: string;
  cantidad: number;
}