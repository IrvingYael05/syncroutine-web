import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

export interface Actividad {
  id?: string;
  bloqueId: string;
  nombre: string;
  tiempoObjetivoSegundos: number;
  orden?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ActividadesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/actividades`;

  getByBloqueId(bloqueId: string): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(`${this.apiUrl}/bloque/${bloqueId}`);
  }

  create(actividad: Actividad): Observable<Actividad> {
    return this.http.post<Actividad>(this.apiUrl, actividad);
  }

  update(id: string, actividad: Actividad): Observable<Actividad> {
    return this.http.put<Actividad>(`${this.apiUrl}/${id}`, actividad);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
