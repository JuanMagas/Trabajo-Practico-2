import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Spinner } from '../../componentes/spinner/spinner';
import { Auth } from '../../servicios/auth';
import { Sesion } from '../../servicios/sesion';

@Component({
  imports: [Spinner],
  selector: 'app-cargando',
  template: `
    <main class="cargando">
      <app-spinner texto="Preparando tu sesión…" />
    </main>
  `,
  styles: `
    .cargando {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `,
})
export class Cargando implements OnInit {
  private auth = inject(Auth);
  private sesion = inject(Sesion);
  private router = inject(Router);

  ngOnInit() {
    if (!this.sesion.token()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.auth.autorizar().subscribe({
      next: ({ usuario }) => {
        this.sesion.guardarUsuario(usuario);
        this.sesion.validada.set(true);
        this.router.navigateByUrl('/publicaciones');
      },
      error: () => {
        // Mismo criterio que el sesionGuard
        if (this.sesion.token()) {
          this.sesion.cerrar('No pudimos verificar tu sesión. Volvé a entrar.');
        }
        this.router.navigateByUrl('/login');
      },
    });
  }
}