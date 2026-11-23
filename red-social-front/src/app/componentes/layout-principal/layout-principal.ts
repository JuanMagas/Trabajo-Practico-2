import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Modal } from '../modal/modal';
import { Auth } from '../../servicios/auth';
import { Sesion } from '../../servicios/sesion';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Modal],
  selector: 'app-layout-principal',
  styleUrl: './layout-principal.css',
  templateUrl: './layout-principal.html',
})
export class LayoutPrincipal {
  private sesion = inject(Sesion);
  private auth = inject(Auth);
  private router = inject(Router);

  usuario = this.sesion.usuario;
  avisoVencimiento = this.sesion.avisoVencimiento;
  extendiendo = signal(false);

  extenderSesion() {
    this.extendiendo.set(true);
    this.auth.refrescar().subscribe({
      next: ({ token }) => {
        this.sesion.actualizarToken(token); // también cierra el aviso y programa el próximo
        this.extendiendo.set(false);
      },
      error: () => this.extendiendo.set(false), // si fue un 401, el interceptor lleva al login
    });
  }

  cerrarAviso() {
    this.avisoVencimiento.set(false);
  }

  salir() {
    this.sesion.cerrar();
    this.router.navigateByUrl('/login');
  }
}