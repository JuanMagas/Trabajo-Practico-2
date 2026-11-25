import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ChartConfiguration } from 'chart.js';
import { forkJoin } from 'rxjs';
import { Grafico } from '../../componentes/grafico/grafico';
import { Spinner } from '../../componentes/spinner/spinner';
import {
  ComentariosPorDia,
  ComentariosPorPublicacion,
  PublicacionesPorUsuario,
} from '../../modelos/estadisticas';
import { EstadisticasApi } from '../../servicios/estadisticas';
import { mensajeDeError } from '../../utilidades/errores';

// Colores para series distintas (probados para daltonismo sobre el fondo oscuro)
const PALETA = ['#D08530', '#4A98D6', '#45A877', '#A97FD9', '#E0644F', '#6C7FE0'];
const GRIS_OTROS = '#4A6078';
const SUPERFICIE = '#1B2633';

// Fecha local en formato "2026-11-24" (el que usa <input type="date">)
function aTextoFecha(fecha: Date): string {
  return fecha.toLocaleDateString('en-CA');
}

function haceDias(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return aTextoFecha(fecha);
}

// Validador de grupo: "desde" no puede ser posterior a "hasta"
function rangoValido(grupo: AbstractControl): ValidationErrors | null {
  const { desde, hasta } = grupo.value;
  return desde && hasta && desde > hasta ? { rangoInvertido: true } : null;
}

@Component({
  imports: [ReactiveFormsModule, Grafico, Spinner],
  selector: 'app-estadisticas',
  styleUrl: './estadisticas.css',
  templateUrl: './estadisticas.html',
})
export class Estadisticas implements OnInit {
  private api = inject(EstadisticasApi);

  hoy = aTextoFecha(new Date());
  atajos = [
    { texto: 'Últimos 7 días', dias: 6 },
    { texto: 'Últimos 30 días', dias: 29 },
    { texto: 'Últimos 90 días', dias: 89 },
  ];

  formulario = new FormGroup(
    {
      desde: new FormControl(haceDias(29), { nonNullable: true, validators: [Validators.required] }),
      hasta: new FormControl(this.hoy, { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: [rangoValido] },
  );

  cargando = signal(true);
  error = signal<string | null>(null);
  // El rango que se está mostrando (puede diferir del formulario hasta que se aplique)
  rango = signal({ desde: '', hasta: '' });

  porUsuario = signal<PublicacionesPorUsuario[]>([]);
  porDia = signal<ComentariosPorDia[]>([]);
  porPublicacion = signal<ComentariosPorPublicacion[]>([]);

  totalPublicaciones = computed(() => this.porUsuario().reduce((t, u) => t + u.cantidad, 0));
  totalComentarios = computed(() => this.porDia().reduce((t, d) => t + d.cantidad, 0));

  // Gráfico 1 (torta): publicaciones por usuario. Más de 6 usuarios se agrupan en "Otros"
  graficoUsuarios = computed<ChartConfiguration>(() => {
    const datos = this.porUsuario();
    const principales = datos.slice(0, PALETA.length - 1);
    const resto = datos.slice(PALETA.length - 1);
    const filas = datos.length <= PALETA.length ? datos : [...principales, { username: 'Otros', cantidad: resto.reduce((t, u) => t + u.cantidad, 0) }];
    const colores = filas.map((f, i) => (f.username === 'Otros' && datos.length > PALETA.length ? GRIS_OTROS : PALETA[i]));
    return {
      type: 'doughnut',
      data: {
        labels: filas.map((f) => (f.username === 'Otros' && datos.length > PALETA.length ? 'Otros' : '@' + f.username)),
        datasets: [{ data: filas.map((f) => f.cantidad), backgroundColor: colores, borderColor: SUPERFICIE, borderWidth: 2 }],
      },
      options: {
        maintainAspectRatio: false,
        cutout: '58%',
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 12, boxHeight: 12, padding: 14, color: '#E8EEF4' } },
          tooltip: { callbacks: { label: (c) => ` ${c.parsed} ${c.parsed === 1 ? 'publicación' : 'publicaciones'}` } },
        },
      },
    };
  });

  // Gráfico 2 (líneas): comentarios por día. Los días sin comentarios se completan con 0
  graficoDias = computed<ChartConfiguration>(() => {
    const { desde, hasta } = this.rango();
    const porFecha = new Map(this.porDia().map((d) => [d.fecha, d.cantidad]));
    const fechas: string[] = [];
    for (let dia = new Date(desde + 'T12:00:00'); aTextoFecha(dia) <= hasta; dia.setDate(dia.getDate() + 1)) {
      fechas.push(aTextoFecha(dia));
    }
    return {
      type: 'line',
      data: {
        labels: fechas.map((f) => `${f.slice(8, 10)}/${f.slice(5, 7)}`),
        datasets: [
          {
            label: 'Comentarios',
            data: fechas.map((f) => porFecha.get(f) ?? 0),
            borderColor: '#5AA9E6',
            backgroundColor: 'rgba(90, 169, 230, 0.12)',
            borderWidth: 2,
            fill: true,
            cubicInterpolationMode: 'monotone', // curva suave sin pasar por debajo de 0
            pointRadius: fechas.length > 45 ? 0 : 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#5AA9E6',
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
          x: { grid: { display: false }, ticks: { maxTicksLimit: 8, maxRotation: 0 } },
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ` ${c.parsed.y} ${c.parsed.y === 1 ? 'comentario' : 'comentarios'}` } },
        },
      },
    };
  });

  // Gráfico 3 (barras horizontales): las 10 publicaciones con más comentarios
  graficoPublicaciones = computed<ChartConfiguration>(() => {
    const datos = this.porPublicacion();
    return {
      type: 'bar',
      data: {
        labels: datos.map((d) => (d.titulo.length > 28 ? d.titulo.slice(0, 27) + '…' : d.titulo)),
        datasets: [
          {
            label: 'Comentarios',
            data: datos.map((d) => d.cantidad),
            backgroundColor: '#F2A541',
            borderRadius: 4,
            maxBarThickness: 22,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        scales: {
          x: { beginAtZero: true, ticks: { precision: 0 } },
          y: { grid: { display: false }, ticks: { color: '#E8EEF4' } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => datos[items[0].dataIndex].titulo, // el título completo
              label: (c) => ` ${c.parsed.x} ${c.parsed.x === 1 ? 'comentario' : 'comentarios'}`,
            },
          },
        },
      },
    };
  });

  ngOnInit() {
    this.aplicar();
  }

  usarAtajo(dias: number) {
    this.formulario.setValue({ desde: haceDias(dias), hasta: this.hoy });
    this.aplicar();
  }

  atajoActivo(dias: number): boolean {
    const { desde, hasta } = this.rango();
    return desde === haceDias(dias) && hasta === this.hoy;
  }

  aplicar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { desde, hasta } = this.formulario.getRawValue();
    this.cargando.set(true);
    this.error.set(null);

    // Los tres pedidos salen juntos y se espera a que terminen todos
    forkJoin({
      usuarios: this.api.publicacionesPorUsuario(desde, hasta),
      dias: this.api.comentariosPorDia(desde, hasta),
      publicaciones: this.api.comentariosPorPublicacion(desde, hasta),
    }).subscribe({
      next: ({ usuarios, dias, publicaciones }) => {
        this.rango.set({ desde, hasta });
        this.porUsuario.set(usuarios);
        this.porDia.set(dias);
        this.porPublicacion.set(publicaciones);
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(mensajeDeError(error));
        this.cargando.set(false);
      },
    });
  }
}