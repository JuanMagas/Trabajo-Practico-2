import { Component, effect, ElementRef, input, OnDestroy, viewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Chart.js trae cada tipo de gráfico por separado: se registran todos una vez
Chart.register(...registerables);

// Estilo común de todos los gráficos, con los colores de Clutch
Chart.defaults.color = '#9AABBD';
Chart.defaults.borderColor = '#243244';
Chart.defaults.font.family = 'Barlow, sans-serif';
Chart.defaults.font.size = 13;
Chart.defaults.plugins.tooltip.backgroundColor = '#121A24';
Chart.defaults.plugins.tooltip.borderColor = '#4A6078';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.titleColor = '#E8EEF4';
Chart.defaults.plugins.tooltip.bodyColor = '#E8EEF4';

@Component({
  selector: 'app-grafico',
  template: `
    <div class="lienzo">
      <canvas #lienzo role="img" [attr.aria-label]="descripcion()"></canvas>
    </div>
  `,
  styles: `
    .lienzo {
      position: relative;
      height: 300px;
    }
  `,
})
export class Grafico implements OnDestroy {
  configuracion = input.required<ChartConfiguration>();
  descripcion = input('');

  private lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');
  private grafico?: Chart;

  constructor() {
    // Cada vez que llegan datos nuevos, se descarta el gráfico anterior y se dibuja otro
    effect(() => {
      const configuracion = this.configuracion();
      this.grafico?.destroy();
      this.grafico = new Chart(this.lienzo().nativeElement, configuracion);
    });
  }

  ngOnDestroy() {
    this.grafico?.destroy();
  }
}