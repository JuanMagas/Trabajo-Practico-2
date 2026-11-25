import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario } from './entities/comentario.entity.js';
import { ComentarioDto } from './dto/comentario.dto.js';
import { PaginacionDto } from './dto/paginacion.dto.js';
import { PublicacionesService } from './publicaciones.service.js';
import { UsuarioDocument } from '../usuarios/entities/usuario.entity.js';

// Datos públicos del autor que se devuelven con cada comentario
const CAMPOS_AUTOR = 'nombre apellido username fotoPerfil';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<Comentario>,
    private readonly publicacionesService: PublicacionesService,
  ) {}

  async listar(publicacionId: Types.ObjectId, paginacion: PaginacionDto) {
    await this.publicacionesService.verificarQueExiste(publicacionId);

    const filtro = { publicacion: publicacionId };
    const [comentarios, total] = await Promise.all([
      this.comentarioModel
        .find(filtro)
        .sort({ createdAt: -1, _id: -1 }) // los más recientes primero
        .skip(paginacion.offset)
        .limit(paginacion.limit)
        .populate('autor', CAMPOS_AUTOR)
        .exec(),
      this.comentarioModel.countDocuments(filtro),
    ]);
    return { comentarios, total };
  }

  async crear(publicacionId: Types.ObjectId, datos: ComentarioDto, autor: UsuarioDocument) {
    await this.publicacionesService.verificarQueExiste(publicacionId);

    const comentario = await this.comentarioModel.create({
      publicacion: publicacionId,
      autor: autor._id,
      mensaje: datos.mensaje,
    });
    return comentario.populate('autor', CAMPOS_AUTOR);
  }

  async editar(
    publicacionId: Types.ObjectId,
    comentarioId: Types.ObjectId,
    datos: ComentarioDto,
    usuario: UsuarioDocument,
  ) {
    await this.publicacionesService.verificarQueExiste(publicacionId);

    const comentario = await this.comentarioModel
      .findOne({ _id: comentarioId, publicacion: publicacionId })
      .exec();
    if (!comentario) {
      throw new NotFoundException('El comentario no existe');
    }
    if (!comentario.autor.equals(usuario._id)) {
      throw new ForbiddenException('Solo podés editar tus propios comentarios');
    }

    comentario.mensaje = datos.mensaje;
    comentario.modificado = true;
    await comentario.save();
    return comentario.populate('autor', CAMPOS_AUTOR);
  }
}