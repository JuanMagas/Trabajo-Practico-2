import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { parse } from 'node:path';

@Injectable()
export class FileService {
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });
  }

  validarImagen(file: Express.Multer.File) {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('El archivo debe ser una imagen');
    }
  }

  subirImagen(file: Express.Multer.File, carpeta: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: carpeta,
          public_id: `${Date.now()}-${parse(file.originalname).name}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result?.secure_url) {
            console.error('Error de Cloudinary:', error);
            reject(new BadRequestException('No se pudo subir la imagen'));
          } else {
            resolve(result.secure_url);
          }
        },
      );
      stream.on('error', () => reject(new BadRequestException('No se pudo subir la imagen')));
      stream.end(file.buffer);
    });
  }
}