import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { memoryStorage } from 'multer';
import type { Types } from 'mongoose';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { FileService } from '../file/file.service.js';
import { SesionGuard } from '../auth/guards/sesion.guard.js';
import { UsuarioActual } from '../auth/decoradores/usuario-actual.decorator.js';
import type { UsuarioDocument } from '../usuarios/entities/usuario.entity.js';

@Controller('publicaciones')
@UseGuards(SesionGuard) // todas las rutas de publicaciones requieren sesión
export class PublicacionesController {
  constructor(
    private readonly publicacionesService: PublicacionesService,
    private readonly fileService: FileService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      limits: { fileSize: 4 * 1024 * 1024 },
    }),
  )
  async crear(
    @Body() datos: CrearPublicacionDto,
    @UsuarioActual() usuario: UsuarioDocument,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imagen = '';
    if (file) {
      this.fileService.validarImagen(file);
      imagen = await this.fileService.subirImagen(file, 'publicaciones');
    }
    return this.publicacionesService.crear(datos, usuario, imagen);
  }

  @Get()
  listar(@Query() filtros: ListarPublicacionesDto, @UsuarioActual() usuario: UsuarioDocument) {
    return this.publicacionesService.listar(filtros, usuario);
  }

  @Delete(':id')
  @HttpCode(204)
  eliminar(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @UsuarioActual() usuario: UsuarioDocument) {
    return this.publicacionesService.eliminar(id, usuario);
  }

  @Post(':id/me-gusta')
  darMeGusta(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @UsuarioActual() usuario: UsuarioDocument) {
    return this.publicacionesService.darMeGusta(id, usuario);
  }

  @Delete(':id/me-gusta')
  quitarMeGusta(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @UsuarioActual() usuario: UsuarioDocument) {
    return this.publicacionesService.quitarMeGusta(id, usuario);
  }
}