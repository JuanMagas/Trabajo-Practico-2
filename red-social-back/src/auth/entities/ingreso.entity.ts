import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

// Un registro por cada login exitoso (para la estadística de ingresos por usuario)
@Schema({ timestamps: { createdAt: 'fecha', updatedAt: false } })
export class Ingreso {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario: Types.ObjectId;
}

export const IngresoSchema = SchemaFactory.createForClass(Ingreso);