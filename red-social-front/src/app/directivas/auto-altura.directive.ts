import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

// <textarea appAutoAltura>: crece a medida que se escribe, sin barra de scroll
@Directive({
  selector: 'textarea[appAutoAltura]',
  host: {
    '(input)': 'ajustar()',
    style: 'overflow: hidden; resize: none;',
  },
})
export class AutoAlturaDirective implements AfterViewInit {
  private textarea = inject<ElementRef<HTMLTextAreaElement>>(ElementRef).nativeElement;

  // Si arranca con texto (por ejemplo, al editar un comentario), se ajusta apenas se dibuja
  ngAfterViewInit() {
    this.ajustar();
  }

  ajustar() {
    // Se achica primero para que también pueda bajar de alto al borrar texto
    this.textarea.style.height = 'auto';
    this.textarea.style.height = `${this.textarea.scrollHeight + 2}px`;
  }
}