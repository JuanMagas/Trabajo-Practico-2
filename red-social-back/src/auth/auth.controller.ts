import { BadRequestException, Body, Controller, Get, HttpCode, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { FileService } from '../file/file.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService,
    private readonly fileService: FileService,
  ) {}

  @Post('registro')
  @UseInterceptors(
    FileInterceptor('fotoPerfil', {
      storage: memoryStorage(),
      limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB: Vercel no acepta pedidos de más de 4,5 MB
    }),
  )
  async registro(@Body() datos: RegistroDto, @UploadedFile() file?: Express.Multer.File) {
    await this.usuariosService.verificarDisponibles(datos.email, datos.username);

    if (file) {
      this.fileService.validarImagen(file);
      datos.fotoPerfil = await this.fileService.subirImagen(file, 'usuarios');
    }

    return this.authService.registro(datos);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() datos: LoginDto) {
    return this.authService.login(datos);
  }

  // Para el validador asincrónico del formulario de registro
  // Ej: GET /auth/disponible/username/juanma -> { disponible: false }
  @Get('disponible/:campo/:valor')
  async disponible(@Param('campo') campo: string, @Param('valor') valor: string) {
    if (campo !== 'email' && campo !== 'username') {
      throw new BadRequestException('El campo debe ser email o username');
    }
    return { disponible: !(await this.usuariosService.existe(campo, valor)) };
  }
}