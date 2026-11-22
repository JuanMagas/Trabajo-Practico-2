import { Directive, inject, input, Renderer2, signal } from '@angular/core';

@Directive({
  selector: '[appMostrarClave]',
  exportAs: 'mostrarClave',
  host: {
    type: 'button',
    '(click)': 'alternar()',
    '[attr.aria-pressed]': 'visible()',
    '[attr.aria-label]': "visible() ? 'Ocultar contraseña' : 'Mostrar contraseña'",
  },
})
export class MostrarClaveDirective {
  // El input de contraseña que este botón controla
  appMostrarClave = input.required<HTMLInputElement>();

  visible = signal(false);

  private renderer = inject(Renderer2);

  alternar() {
    this.visible.set(!this.visible());
    this.renderer.setAttribute(this.appMostrarClave(), 'type', this.visible() ? 'text' : 'password');
  }
}