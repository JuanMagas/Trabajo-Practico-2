import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

// Pone el cursor en el elemento apenas aparece en pantalla (y al final del texto, si tiene)
@Directive({ selector: 'input[appAutofoco], textarea[appAutofoco]' })
export class AutofocoDirective implements AfterViewInit {
  private elemento = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef).nativeElement;

  ngAfterViewInit() {
    this.elemento.focus();
    const largo = this.elemento.value.length;
    this.elemento.setSelectionRange(largo, largo);
  }
}