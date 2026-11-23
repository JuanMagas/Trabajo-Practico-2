import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
    <div class="spinner" role="status">
      <svg width="48" height="48" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <circle cx="16" cy="16" r="10" />
        <path d="M16 2v8M16 22v8M2 16h8M22 16h8" />
      </svg>
      <span>{{ texto() }}</span>
    </div>
  `,
  styles: `
    .spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      color: var(--texto-secundario);
    }
    svg {
      color: var(--primario);
    }
    @media (prefers-reduced-motion: no-preference) {
      svg {
        animation: girar 1.1s linear infinite;
      }
    }
    @keyframes girar {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class Spinner {
  texto = input('Cargando…');
}