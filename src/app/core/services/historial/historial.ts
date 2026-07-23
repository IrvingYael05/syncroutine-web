import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

export interface ResumenGlobal {
  tiempoTotalSegundos: number;
  rachaDiasActivos: number;
  tiempoPromedioDiario: number;
  tiempoPorDia: { [fecha: string]: number };
}

export interface MetricaActividad {
  actividadId: string;
  nombre: string;
  tiempoObjetivo: number;
  tiempoPromedioReal: number;
  mejorTiempo: number;
  peorTiempo: number;
}

export interface CrearHistorialDto {
  userId: string;
  actividadId: string;
  tiempoRealSegundos: number;
}

export interface MetricasBloque {
  nombreBloque: string;
  tiempoObjetivoTotal: number;
  precisionPorcentaje: number;
  fechas: string[];
  tiemposReales: number[];
  detalleActividades: MetricaActividad[];
}

@Injectable({
  providedIn: 'root',
})
export class HistorialService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/historial`;

  getResumenGlobal(
    userId: string,
    fechaInicio?: string,
    fechaFin?: string,
  ): Observable<ResumenGlobal> {
    let params = new HttpParams();
    if (fechaInicio && fechaFin) {
      params = params.set('fechaInicio', fechaInicio).set('fechaFin', fechaFin);
    }
    return this.http.get<ResumenGlobal>(`${this.apiUrl}/resumen/${userId}`, { params });
  }

  getMetricasBloque(
    userId: string,
    bloqueId: string,
    fechaInicio?: string,
    fechaFin?: string,
  ): Observable<MetricasBloque> {
    let params = new HttpParams();
    if (fechaInicio && fechaFin) {
      params = params.set('fechaInicio', fechaInicio).set('fechaFin', fechaFin);
    }
    return this.http.get<MetricasBloque>(
      `${this.apiUrl}/metricas/bloque/${bloqueId}/usuario/${userId}`,
      { params },
    );
  }

  registrarHistorial(registro: CrearHistorialDto): Observable<any> {
    return this.http.post(this.apiUrl, registro);
  }
}
