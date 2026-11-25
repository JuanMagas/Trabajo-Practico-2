import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service.js';
import { RangoFechasDto } from './dto/rango-fechas.dto.js';
import { SesionGuard } from '../auth/guards/sesion.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

// Solo administradores
@Controller('estadisticas')
@UseGuards(SesionGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() rango: RangoFechasDto) {
    return this.estadisticasService.publicacionesPorUsuario(rango);
  }

  @Get('comentarios-por-dia')
  comentariosPorDia(@Query() rango: RangoFechasDto) {
    return this.estadisticasService.comentariosPorDia(rango);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() rango: RangoFechasDto) {
    return this.estadisticasService.comentariosPorPublicacion(rango);
  }
}