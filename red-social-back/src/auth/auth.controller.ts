import { Body, Controller, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
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
      limits: { fileSize: 5 * 1024 * 1024 },
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
}