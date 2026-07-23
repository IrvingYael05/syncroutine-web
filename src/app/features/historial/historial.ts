import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- NECESARIO PARA EL <select>
import { NgApexchartsModule } from 'ng-apexcharts';

import {
  HistorialService,
  ResumenGlobal,
  MetricasBloque,
} from '../../core/services/historial/historial';
import { BloquesService, Bloque } from '../../core/services/bloques/bloques';
import { AuthService } from '../../core/services/auth/auth';
import { ToastService } from '../../core/services/toast/toast.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, FormsModule],
  templateUrl: './historial.html',
})
export class Historial implements OnInit {
  private historialService = inject(HistorialService);
  private bloquesService = inject(BloquesService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  isLoadingGlobal = true;
  isLoadingBloque = false;
  currentUserId: string = '';
  filtroTiempo: string = '7dias';

  // Nivel 1: Datos Globales
  resumen: ResumenGlobal | null = null;
  chartGlobalOptions: any = {};

  // Nivel 2: Datos de Bloque
  misBloques: Bloque[] = [];
  bloqueSeleccionadoId: string = '';
  metricasBloque: MetricasBloque | null = null;
  chartBloqueOptions: any = {};

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = user.id;
      this.cargarResumenGlobal(this.currentUserId);
      this.cargarListaBloques(this.currentUserId);
    }
  }

  // --- NIVEL 1: RESUMEN GLOBAL ---
  cargarResumenGlobal(userId: string) {
    this.isLoadingGlobal = true;
    const fechas = this.obtenerFechasFiltro(); // Obtenemos el cálculo

    this.historialService.getResumenGlobal(userId, fechas.inicio, fechas.fin).subscribe({
      next: (data) => {
        this.resumen = data;
        this.configurarGraficaGlobal(data.tiempoPorDia);
        this.isLoadingGlobal = false;
      },
      error: () => {
        this.toast.error('Error al cargar métricas globales.');
        this.isLoadingGlobal = false;
      },
    });
  }

  configurarGraficaGlobal(tiempoPorDia: { [key: string]: number }) {
    const fechas = Object.keys(tiempoPorDia).sort();
    const datosMinutos = fechas.map((f) => Math.round(tiempoPorDia[f] / 60));

    this.chartGlobalOptions = {
      series: [{ name: 'Minutos de Actividad', data: datosMinutos }],
      chart: {
        type: 'area',
        height: 320,
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif',
      },
      colors: ['#10b981'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      xaxis: {
        categories: fechas.map((f) => `${f.split('-')[2]}/${f.split('-')[1]}`),
        labels: { style: { colors: '#94a3b8' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { labels: { style: { colors: '#94a3b8' } } },
      grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
      tooltip: { theme: 'dark' },
    };
  }

  // --- NIVEL 2: EFICIENCIA POR BLOQUE ---
  cargarListaBloques(userId: string) {
    this.bloquesService.getByUserId(userId).subscribe((bloques) => {
      this.misBloques = bloques;
    });
  }

  onBloqueSeleccionado() {
    if (!this.bloqueSeleccionadoId) {
      this.metricasBloque = null;
      return;
    }

    this.isLoadingBloque = true;

    const fechas = this.obtenerFechasFiltro();

    this.historialService
      .getMetricasBloque(this.currentUserId, this.bloqueSeleccionadoId, fechas.inicio, fechas.fin)
      .subscribe({
        next: (data) => {
          this.metricasBloque = data;
          this.configurarGraficaBloque(data);
          this.isLoadingBloque = false;
        },
        error: () => {
          this.toast.error('Error al cargar el análisis del bloque.');
          this.isLoadingBloque = false;
        },
      });
  }

  configurarGraficaBloque(data: MetricasBloque) {
    // 1. Convertimos los tiempos a minutos para la gráfica
    const datosRealesMinutos = data.tiemposReales.map((seg) => Math.round(seg / 60));
    const objetivoMinutos = Math.round(data.tiempoObjetivoTotal / 60);

    // 2. Formateamos las fechas DD/MM
    const fechasFormateadas = data.fechas.map((f) => `${f.split('-')[2]}/${f.split('-')[1]}`);

    this.chartBloqueOptions = {
      series: [{ name: 'Tiempo Real', data: datosRealesMinutos }],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif',
      },
      colors: ['#3b82f6'],
      plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
      dataLabels: { enabled: false },

      annotations: {
        yaxis: [
          {
            y: objetivoMinutos,
            borderColor: '#10b981',
            strokeDashArray: 5,
            borderWidth: 3,
            label: {
              borderColor: '#10b981',
              style: { color: '#fff', background: '#10b981', fontSize: '12px', fontWeight: 'bold' },
              text: `Objetivo: ${objetivoMinutos}m`,
            },
          },
        ],
      },

      xaxis: {
        categories: fechasFormateadas,
        labels: { style: { colors: '#94a3b8' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { labels: { style: { colors: '#94a3b8' } } },
      grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
      tooltip: { theme: 'dark' },
    };
  }

  // --- UTILIDAD ---
  formatTime(totalSeconds: number): string {
    if (!totalSeconds) return '0m';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  onFiltroCambio() {
    if (this.currentUserId) {
      this.cargarResumenGlobal(this.currentUserId);

      if (this.bloqueSeleccionadoId) {
        this.onBloqueSeleccionado();
      }
    }
  }

  obtenerFechasFiltro(): { inicio?: string; fin?: string } {
    if (this.filtroTiempo === 'todos') return { inicio: undefined, fin: undefined };

    const fin = new Date();
    const inicio = new Date();

    if (this.filtroTiempo === '7dias') inicio.setDate(fin.getDate() - 6);
    if (this.filtroTiempo === '30dias') inicio.setDate(fin.getDate() - 29);

    return {
      inicio: inicio.toISOString().split('T')[0],
      fin: fin.toISOString().split('T')[0],
    };
  }

  obtenerDesviacion(
    promedioReal: number,
    objetivo: number,
  ): { texto: string; estado: 'bien' | 'mal' | 'exacto' | 'vacio' } {
    if (!promedioReal) return { texto: 'Sin datos', estado: 'vacio' };

    const diferencia = promedioReal - objetivo;
    const diferenciaString = diferencia > 60 ? this.formatTime(Math.abs(diferencia)) : `${Math.abs(diferencia)}s`;

    if (diferencia === 0) return { texto: 'Exacto', estado: 'exacto' };

    const estado = diferencia > 0 ? 'mal' : 'bien';
    const signo = diferencia > 0 ? '+' : '-';

    console.log(`Promedio Real: ${promedioReal}s, Objetivo: ${objetivo}s, Diferencia: ${diferencia}s`, `Estado: ${estado}`, `Signo: ${signo}`, `Diferencia String: ${diferenciaString}`);

    return {
      texto: `${signo}${diferenciaString}`,
      estado,
    };
  }
}
