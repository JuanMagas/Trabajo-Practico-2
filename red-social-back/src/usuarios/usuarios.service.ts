import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, mongo } from 'mongoose';
import { PasswordHasher } from '@nestjs/authentication';
import { Usuario } from './entities/usuario.entity.js';
import { RegistroDto } from '../auth/dto/registro.dto.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarioModel: Model<Usuario>,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async crear(datos: RegistroDto) {
    await this.verificarDisponibles(datos.email, datos.username);

    const passwordHasheada = await this.passwordHasher.hash(datos.password);

    try {
      return await this.usuarioModel.create({ ...datos, password: passwordHasheada });
    } catch (error) {
      if (error instanceof mongo.MongoServerError && error.code === 11000) {
        throw new ConflictException('El correo o el nombre de usuario ya están en uso');
      }
      throw error;
    }
  }

  async verificarDisponibles(email: string, username: string) {
    if (await this.existe('email', email)) {
      throw new ConflictException('El correo ya está registrado');
    }
    if (await this.existe('username', username)) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }
  }

  async existe(campo: 'email' | 'username', valor: string) {
    const usuario = await this.usuarioModel.findOne({ [campo]: valor.toLowerCase().trim() }).exec();
    return usuario !== null;
  }

  async buscarPorIdentificador(identificador: string) {
    const valor = identificador.toLowerCase().trim();
    const campo = valor.includes('@') ? 'email' : 'username';
    return this.usuarioModel.findOne({ [campo]: valor }).exec();
  }

  async buscarPorId(id: string) {
    return this.usuarioModel.findById(id).exec();
  }
}