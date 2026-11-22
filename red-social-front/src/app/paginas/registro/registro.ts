import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { Modal } from '../../componentes/modal/modal';
import { Auth } from '../../servicios/auth';
import { Sesion } from '../../servicios/sesion';
import { mensajeDeError } from '../../utilidades/errores';
import { MostrarClaveDirective } from '../../directivas/mostrar-clave.directive';
import {
  clavesCoincidenValidator,
  disponibleValidator,
  fechaPasadaValidator,
  requisitosClaveValidator,
} from '../../validadores/usuario.validadores';

const TAMANIO_MAXIMO_FOTO = 5 * 1024 * 1024; // 5 MB, igual que el back

@Component({
  imports: [ReactiveFormsModule, RouterLink, MostrarClaveDirective, Modal],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro {
  private auth = inject(Auth);
  private sesion = inject(Sesion);
  private router = inject(Router);

  formulario = new FormGroup(
    {
      nombre: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      apellido: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [disponibleValidator('email')],
        updateOn: 'blur',
      }),
      username: new FormControl('', {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9_.]+$/),
        ],
        asyncValidators: [disponibleValidator('username')],
        updateOn: 'blur',
      }),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        requisitosClaveValidator(),
      ]),
      repetirPassword: new FormControl('', [Validators.required]),
      fechaNacimiento: new FormControl('', [Validators.required, fechaPasadaValidator()]),
      descripcion: new FormControl('', [Validators.maxLength(200)]),
    },
    { validators: [clavesCoincidenValidator('password', 'repetirPassword')] },
  );

  foto = signal<File | null>(null);
  previsualizacion = signal<string | null>(null);
  errorFoto = signal<string | null>(null);

  enviando = signal(false);
  registroExitoso = signal(false);
  errorEnvio = signal<string | null>(null);

  // Devuelve el mensaje del primer error de un campo, solo si el usuario ya lo tocó
  error(campo: keyof typeof this.formulario.controls): string | null {
    const control = this.formulario.controls[campo];
    if (!control.touched || !control.errors) {
      return null;
    }
    const e = control.errors;
    if (e['required']) return 'Este campo es obligatorio.';
    if (e['email']) return 'El correo no tiene un formato válido.';
    if (e['minlength']) return `Tiene que tener al menos ${e['minlength'].requiredLength} caracteres.`;
    if (e['maxlength']) return `No puede superar los ${e['maxlength'].requiredLength} caracteres.`;
    if (e['pattern']) return 'Solo letras, números, punto y guion bajo.';
    if (e['sinMayuscula']) return 'Le falta una mayúscula.';
    if (e['sinNumero']) return 'Le falta un número.';
    if (e['fechaFutura']) return 'La fecha no puede ser futura.';
    if (e['noDisponible']) {
      return campo === 'email' ? 'Ese correo ya está registrado.' : 'Ese nombre de usuario ya está en uso.';
    }
    return 'El valor no es válido.';
  }

  // Para mostrar "Disponible" debajo del correo y del usuario
  disponible(campo: 'email' | 'username'): boolean {
    const control = this.formulario.controls[campo];
    return control.touched && control.valid && !!control.value;
  }

  clavesNoCoinciden(): boolean {
    return (
      this.formulario.controls.repetirPassword.touched &&
      this.formulario.hasError('clavesNoCoinciden')
    );
  }

  clavesCoinciden(): boolean {
    const repetida = this.formulario.controls.repetirPassword;
    return !!repetida.value && repetida.valid && !this.formulario.hasError('clavesNoCoinciden');
  }

  elegirFoto(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    this.errorFoto.set(null);

    if (!archivo) {
      return;
    }
    if (!archivo.type.startsWith('image/')) {
      this.errorFoto.set('El archivo tiene que ser una imagen.');
      input.value = '';
      return;
    }
    if (archivo.size > TAMANIO_MAXIMO_FOTO) {
      this.errorFoto.set('La imagen no puede pesar más de 5 MB.');
      input.value = '';
      return;
    }

    const anterior = this.previsualizacion();
    if (anterior) {
      URL.revokeObjectURL(anterior);
    }
    this.foto.set(archivo);
    this.previsualizacion.set(URL.createObjectURL(archivo));
  }

  async enviar() {
    // Si todavía se está consultando si el usuario está libre, esperamos la respuesta
    if (this.formulario.pending) {
      await firstValueFrom(this.formulario.statusChanges.pipe(filter((s) => s !== 'PENDING')));
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { repetirPassword, ...valores } = this.formulario.getRawValue();
    const datos = new FormData();
    for (const [campo, valor] of Object.entries(valores)) {
      datos.append(campo, valor ?? '');
    }
    const foto = this.foto();
    if (foto) {
      datos.append('fotoPerfil', foto);
    }

    this.enviando.set(true);
    this.auth.registro(datos).subscribe({
      next: (respuesta) => {
        this.sesion.iniciar(respuesta.usuario);
        this.enviando.set(false);
        this.registroExitoso.set(true);
      },
      error: (error) => {
        this.enviando.set(false);
        this.errorEnvio.set(mensajeDeError(error));
      },
    });
  }

  irAPublicaciones() {
    this.router.navigateByUrl('/publicaciones');
  }
}