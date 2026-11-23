import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Modal } from '../../componentes/modal/modal';
import { Auth } from '../../servicios/auth';
import { Sesion } from '../../servicios/sesion';
import { mensajeDeError } from '../../utilidades/errores';
import { MostrarClaveDirective } from '../../directivas/mostrar-clave.directive';
import { requisitosClaveValidator } from '../../validadores/usuario.validadores';

interface Actividad {
  usuario: string;
  accion: 'me-gusta' | 'comento' | 'publico';
  publicacion: string;
  hace: string;
}

@Component({
  imports: [ReactiveFormsModule, RouterLink, MostrarClaveDirective, Modal],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(Auth);
  private sesion = inject(Sesion);
  private router = inject(Router);

  enviando = signal(false);
  motivoCierre = this.sesion.motivoCierre;
  errorEnvio = signal<string | null>(null);

  formulario = new FormGroup({
    identificador: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      requisitosClaveValidator(),
    ]),
  });

  // Actividad de ejemplo para el panel de la izquierda
  actividad: Actividad[] = [
    { usuario: 'anag', accion: 'me-gusta', publicacion: 'Ace con la Deagle en Inferno', hace: 'hace 2 min' },
    { usuario: 'brunoo', accion: 'comento', publicacion: 'Retake de B sin utilidad', hace: 'hace 5 min' },
    { usuario: 'fran.ow', accion: 'publico', publicacion: 'Buscamos support para el torneo del sábado', hace: 'hace 12 min' },
    { usuario: 'tomi_vk', accion: 'me-gusta', publicacion: 'Mi setup nuevo, por fin con 240 Hz', hace: 'hace 20 min' },
  ];

  error(campo: keyof typeof this.formulario.controls): string | null {
    const control = this.formulario.controls[campo];
    if (!control.touched || !control.errors) {
      return null;
    }
    const e = control.errors;
    if (e['required']) return 'Este campo es obligatorio.';
    if (e['minlength']) return 'La contraseña tiene al menos 8 caracteres.';
    if (e['sinMayuscula'] || e['sinNumero']) return 'La contraseña tiene al menos una mayúscula y un número.';
    return 'El valor no es válido.';
  }

  enviar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { identificador, password } = this.formulario.getRawValue();
    this.enviando.set(true);
    this.auth.login(identificador!, password!).subscribe({
      next: (respuesta) => {
        this.sesion.iniciar(respuesta.usuario, respuesta.token);
        this.router.navigateByUrl('/publicaciones');
      },
      error: (error) => {
        this.enviando.set(false);
        this.errorEnvio.set(mensajeDeError(error));
      },
    });
  }
}