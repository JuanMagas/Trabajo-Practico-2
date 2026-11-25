import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { memoryStorage } from 'multer';
import { UsuariosService } from './usuarios.service.js';
import { FileService } from '../file/file.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { SesionGuard } from '../auth/guards/sesion.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { UsuarioActual } from '../auth/decoradores/usuario-actual.decorator.js';
import type { UsuarioDocument } from './entities/usuario.entity.js';

// Todas las rutas: primero hay que tener sesión y después ser administrador
@Controller('usuarios')
@UseGuards(SesionGuard, AdminGuard)
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly fileService: FileService,
  ) {}

  @Get()
  listar() {
    return this.usuariosService.listar();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('fotoPerfil', {
      storage: memoryStorage(),
      limits: { fileSize: 4 * 1024 * 1024 },
    }),
  )
  async crear(@Body() datos: CrearUsuarioDto, @UploadedFile() file?: Express.Multer.File) {
    await this.usuariosService.verificarDisponibles(datos.email, datos.username);

    if (file) {
      this.fileService.validarImagen(file);
      datos.fotoPerfil = await this.fileService.subirImagen(file, 'usuarios');
    }

    return this.usuariosService.crear(datos);
  }

  // Baja lógica: no se borra, se marca activo = false
  @Delete(':id')
  @HttpCode(204)
  async deshabilitar(@Param('id', ParseObjectIdPipe) id: string, @UsuarioActual() admin: UsuarioDocument) {
    if (admin._id.toString() === id.toString()) {
      throw new BadRequestException('No podés deshabilitar tu propia cuenta');
    }
    await this.usuariosService.cambiarActivo(id, false);
  }

  @Post(':id/habilitar')
  @HttpCode(204)
  async habilitar(@Param('id', ParseObjectIdPipe) id: string) {
    await this.usuariosService.cambiarActivo(id, true);
  }
}