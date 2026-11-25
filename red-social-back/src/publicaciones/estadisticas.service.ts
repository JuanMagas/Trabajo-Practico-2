import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './entities/publicacion.entity.js';
import { Comentario } from './entities/comentario.entity.js';
import { RangoFechasDto } from './dto/rango-fechas.dto.js';

const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
  ) {}

  // Gráfico 1: cuántas publicaciones hizo cada usuario en el lapso
  async publicacionesPorUsuario(rango: RangoFechasDto) {
    const { inicio, fin } = this.convertirRango(rango);
    return this.publicacionModel.aggregate([
      { $match: { activa: true, createdAt: { $gte: inicio, $lt: fin } } },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      { $lookup: { from: 'usuarios', localField: '_id', foreignField: '_id', as: 'usuario' } },
      { $unwind: '$usuario' },
      { $project: { _id: 0, username: '$usuario.username', cantidad: 1 } },
      { $sort: { cantidad: -1, username: 1 } },
    ]);
  }

  // Gráfico 2: cuántos comentarios se hicieron cada día del lapso
  async comentariosPorDia(rango: RangoFechasDto) {
    const { inicio, fin } = this.convertirRango(rango);
    return this.comentarioModel.aggregate([
      { $match: { createdAt: { $gte: inicio, $lt: fin } } },
      ...this.soloDePublicacionesActivas(),
      {
        $group: {
          // "2026-11-24", contado en horario de Argentina
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: ZONA_HORARIA } },
          cantidad: { $sum: 1 },
        },
      },
      { $project: { _id: 0, fecha: '$_id', cantidad: 1 } },
      { $sort: { fecha: 1 } },
    ]);
  }

  // Gráfico 3: cuántos comentarios recibió cada publicación en el lapso (las 10 con más)
  async comentariosPorPublicacion(rango: RangoFechasDto) {
    const { inicio, fin } = this.convertirRango(rango);
    return this.comentarioModel.aggregate([
      { $match: { createdAt: { $gte: inicio, $lt: fin } } },
      ...this.soloDePublicacionesActivas(),
      { $group: { _id: '$publicacion', titulo: { $first: '$pub.titulo' }, cantidad: { $sum: 1 } } },
      { $project: { _id: 0, publicacionId: '$_id', titulo: 1, cantidad: 1 } },
      { $sort: { cantidad: -1, titulo: 1 } },
      { $limit: 10 },
    ]);
  }

  // Une cada comentario con su publicación y descarta los de publicaciones dadas de baja
  private soloDePublicacionesActivas() {
    return [
      { $lookup: { from: 'publicaciones', localField: 'publicacion', foreignField: '_id', as: 'pub' } },
      { $unwind: '$pub' },
      { $match: { 'pub.activa': true } },
    ];
  }

  // "2026-11-01" y "2026-11-30" -> desde las 00:00 del 1 hasta las 00:00 del 1/12 (hora argentina)
  private convertirRango({ desde, hasta }: RangoFechasDto) {
    const inicio = new Date(`${desde.slice(0, 10)}T00:00:00-03:00`);
    const fin = new Date(`${hasta.slice(0, 10)}T00:00:00-03:00`);
    fin.setDate(fin.getDate() + 1);
    if (inicio >= fin) {
      throw new BadRequestException('La fecha "desde" no puede ser posterior a "hasta"');
    }
    return { inicio, fin };
  }
}