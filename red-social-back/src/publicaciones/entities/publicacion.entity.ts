import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// Cada me gusta guarda quién y cuándo (la fecha se usa en las estadísticas)
@Schema({ _id: false })
export class MeGusta {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario: Types.ObjectId;

  @Prop({ default: Date.now })
  fecha: Date;
}

const MeGustaSchema = SchemaFactory.createForClass(MeGusta);

export type PublicacionDocument = HydratedDocument<Publicacion>;

// collection: sin esto Mongoose la llamaría "publicacions" (pluraliza agregando una s)
@Schema({ timestamps: true, collection: 'publicaciones' })
export class Publicacion {
  @Prop({ required: true, trim: true, maxlength: 100 })
  titulo: string;

  @Prop({ required: true, trim: true, maxlength: 1000 })
  mensaje: string;

  @Prop({ default: '' })
  imagen: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true, index: true })
  autor: Types.ObjectId;

  @Prop({ type: [MeGustaSchema], default: [] })
  meGusta: MeGusta[];

  @Prop({ default: true })
  activa: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);