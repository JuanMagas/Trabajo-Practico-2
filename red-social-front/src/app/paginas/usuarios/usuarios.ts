import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Modal } from '../../componentes/modal/modal';
import { Spinner } from '../../componentes/spinner/spinner';
import { Usuario } from '../../modelos/usuario';
import { Sesion } from '../../servicios/sesion';
import { UsuariosApi } from '../../servicios/usuarios';
import { mensajeDeError } from '../../utilidades/errores';
import { InicialesPipe } from '../../pipes/iniciales.pipe';

@Component({
  imports: [RouterLink, Modal, Spinner, InicialesPipe],
  selector: 'app-usuarios',
  styleUrl: './usuarios.css',
  templateUrl: './usuarios.html',
})
export class Usuarios implements OnInit {
  private api = inject(UsuariosApi);
  private sesion = inject(Sesion);
  miId = computed(() => this.sesion.usuario()?._id);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  // El usuario que se está por deshabilitar (abre el modal de confirmación)
  aDeshabilitar = signal<Usuario | null>(null);
  procesando = signal<string | null>(null); // id del usuario en proceso

  activos = computed(() => this.usuarios().filter((u) => u.activo).length);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.api.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(mensajeDeError(error));
        this.cargando.set(false);
      },
    });
  }

  confirmarBaja() {
    const usuario = this.aDeshabilitar();
    if (!usuario) {
      return;
    }
    this.aDeshabilitar.set(null);
    this.cambiarEstado(usuario, false);
  }

  habilitar(usuario: Usuario) {
    this.cambiarEstado(usuario, true);
  }

  private cambiarEstado(usuario: Usuario, activo: boolean) {
    this.procesando.set(usuario._id);
    const pedido = activo ? this.api.habilitar(usuario._id) : this.api.deshabilitar(usuario._id);
    pedido.subscribe({
      next: () => {
        // Se actualiza solo ese usuario en la lista, sin volver a pedirla
        this.usuarios.update((lista) => lista.map((u) => (u._id === usuario._id ? { ...u, activo } : u)));
        this.procesando.set(null);
      },
      error: (error) => {
        this.error.set(mensajeDeError(error));
        this.procesando.set(null);
      },
    });
  }
}