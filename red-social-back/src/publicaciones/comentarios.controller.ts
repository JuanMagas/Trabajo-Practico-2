import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import type { Types } from 'mongoose';
import { ComentariosService } from './comentarios.service.js';
import { ComentarioDto } from './dto/comentario.dto.js';
import { PaginacionDto } from './dto/paginacion.dto.js';
import { SesionGuard } from '../auth/guards/sesion.guard.js';
import { UsuarioActual } from '../auth/decoradores/usuario-actual.decorator.js';
import type { UsuarioDocument } from '../usuarios/entities/usuario.entity.js';

@Controller('publicaciones/:id/comentarios')
@UseGuards(SesionGuard)
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Get()
  listar(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @Query() paginacion: PaginacionDto) {
    return this.comentariosService.listar(id, paginacion);
  }

  @Post()
  crear(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() datos: ComentarioDto,
    @UsuarioActual() usuario: UsuarioDocument,
  ) {
    return this.comentariosService.crear(id, datos, usuario);
  }

  @Put(':comentarioId')
  editar(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Param('comentarioId', ParseObjectIdPipe) comentarioId: Types.ObjectId,
    @Body() datos: ComentarioDto,
    @UsuarioActual() usuario: UsuarioDocument,
  ) {
    return this.comentariosService.editar(id, comentarioId, datos, usuario);
  }
}