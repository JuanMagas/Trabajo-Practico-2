import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Publicacion } from './entities/publicacion.entity.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { UsuarioDocument } from '../usuarios/entities/usuario.entity.js';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private readonly publicacionModel: Model<Publicacion>,
  ) {}

  async crear(datos: CrearPublicacionDto, autor: UsuarioDocument, imagen = '') {
    const publicacion = await this.publicacionModel.create({ ...datos, imagen, autor: autor._id });
    return this.buscarUna(publicacion._id, autor._id);
  }

  async listar(filtros: ListarPublicacionesDto, usuarioActual: UsuarioDocument) {
    const condicion: Record<string, unknown> = { activa: true };
    if (filtros.usuario) {
      condicion.autor = new Types.ObjectId(filtros.usuario);
    }

    const orden: Record<string, 1 | -1> =
      filtros.orden === 'meGusta'
        ? { cantidadMeGusta: -1, createdAt: -1, _id: -1 }
        : { createdAt: -1, _id: -1 };

    const [publicaciones, total] = await Promise.all([
      this.publicacionModel.aggregate([
        { $match: condicion },
        ...this.calcularMeGusta(usuarioActual._id),
        { $sort: orden },
        { $skip: filtros.offset },
        { $limit: filtros.limit },
        ...this.completarAutor(),
      ]),
      this.publicacionModel.countDocuments(condicion),
    ]);

    return { publicaciones, total };
  }

  async eliminar(id: Types.ObjectId, usuario: UsuarioDocument) {
    const publicacion = await this.publicacionModel.findOne({ _id: id, activa: true }).exec();
    if (!publicacion) {
      throw new NotFoundException('La publicación no existe');
    }

    const esAutor = publicacion.autor.equals(usuario._id);
    const esAdmin = usuario.perfil === 'administrador';
    if (!esAutor && !esAdmin) {
      throw new ForbiddenException('Solo podés eliminar tus propias publicaciones');
    }

    publicacion.activa = false; // baja lógica
    await publicacion.save();
  }

  async darMeGusta(id: Types.ObjectId, usuario: UsuarioDocument) {
    // Solo agrega si ese usuario todavía no está en la lista
    const resultado = await this.publicacionModel.updateOne(
      { _id: id, activa: true, 'meGusta.usuario': { $ne: usuario._id } },
      { $push: { meGusta: { usuario: usuario._id, fecha: new Date() } } },
    );
    if (resultado.matchedCount === 0) {
      await this.verificarQueExiste(id);
      throw new ConflictException('Ya le diste me gusta a esta publicación');
    }
    return this.estadoMeGusta(id, usuario._id);
  }

  async quitarMeGusta(id: Types.ObjectId, usuario: UsuarioDocument) {
    // Solo quita si ese usuario está en la lista
    const resultado = await this.publicacionModel.updateOne(
      { _id: id, activa: true, 'meGusta.usuario': usuario._id },
      { $pull: { meGusta: { usuario: usuario._id } } },
    );
    if (resultado.matchedCount === 0) {
      await this.verificarQueExiste(id);
      throw new ConflictException('No le habías dado me gusta a esta publicación');
    }
    return this.estadoMeGusta(id, usuario._id);
  }

  private async buscarUna(id: Types.ObjectId, usuarioId: Types.ObjectId) {
    const [publicacion] = await this.publicacionModel.aggregate([
      { $match: { _id: id } },
      ...this.calcularMeGusta(usuarioId),
      ...this.completarAutor(),
    ]);
    return publicacion;
  }

  // Una sola publicación, con los mismos datos que el listado
  async obtener(id: Types.ObjectId, usuario: UsuarioDocument) {
    await this.verificarQueExiste(id);
    return this.buscarUna(id, usuario._id);
  }

  // Pública: la usa también ComentariosService
  async verificarQueExiste(id: Types.ObjectId) {
    const existe = await this.publicacionModel.exists({ _id: id, activa: true });
    if (!existe) {
      throw new NotFoundException('La publicación no existe');
    }
  }

  private async estadoMeGusta(id: Types.ObjectId, usuarioId: Types.ObjectId) {
    const publicacion = await this.publicacionModel.findById(id, { meGusta: 1 }).lean().exec();
    const meGusta = publicacion?.meGusta ?? [];
    return {
      cantidadMeGusta: meGusta.length,
      meGustaYo: meGusta.some((m) => m.usuario.equals(usuarioId)),
    };
  }

  // Agrega la cantidad de me gusta, si el usuario actual ya dio el suyo y la cantidad de comentarios.
  // La lista completa no se envía al front: solo los dos datos que necesita.
  private calcularMeGusta(usuarioId: Types.ObjectId): PipelineStage[] {
    return [
      {
        $addFields: {
          cantidadMeGusta: { $size: '$meGusta' },
          meGustaYo: { $in: [usuarioId, '$meGusta.usuario'] },
        },
      },
            { $project: { meGusta: 0 } },
      {
        $lookup: {
          from: 'comentarios',
          localField: '_id',
          foreignField: 'publicacion',
          as: 'comentarios',
          pipeline: [{ $count: 'cantidad' }],
        },
      },
      {
        $addFields: {
          cantidadComentarios: { $ifNull: [{ $first: '$comentarios.cantidad' }, 0] },
        },
      },
      { $project: { comentarios: 0 } },
    ];
  }

  // Reemplaza el id del autor por sus datos públicos (sin contraseña ni correo)
  private completarAutor(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'usuarios',
          localField: 'autor',
          foreignField: '_id',
          as: 'autor',
          pipeline: [{ $project: { nombre: 1, apellido: 1, username: 1, fotoPerfil: 1 } }],
        },
      },
      { $unwind: '$autor' },
    ];
  }
}