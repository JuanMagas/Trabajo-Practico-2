import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Sesion } from '../../servicios/sesion';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-layout-principal',
  styleUrl: './layout-principal.css',
  templateUrl: './layout-principal.html',
})
export class LayoutPrincipal {
  private sesion = inject(Sesion);
  private router = inject(Router);

  usuario = this.sesion.usuario;

  salir() {
    this.sesion.cerrar();
    this.router.navigateByUrl('/login');
  }
}