import { Component, effect, ElementRef, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-modal',
  styleUrl: './modal.css',
  templateUrl: './modal.html',
})
export class Modal {
  abierto = input(false);
  titulo = input.required<string>();
  tipo = input<'exito' | 'error'>('exito');

  cerrado = output<void>();

  private dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    // Abre o cierra el <dialog> cada vez que cambia "abierto"
    effect(() => {
      const dialogo = this.dialogo().nativeElement;
      if (this.abierto() && !dialogo.open) {
        dialogo.showModal();
      } else if (!this.abierto() && dialogo.open) {
        dialogo.close();
      }
    });
  }
}