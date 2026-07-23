import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

export interface Bloque {
  id?: string;
  userId: string;
  nombre: string;
  esAleatorio: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BloquesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bloques`;

  getByUserId(userId: string): Observable<Bloque[]> {
    return this.http.get<Bloque[]>(`${this.apiUrl}/usuario/${userId}`);
  }

  getById(id: string): Observable<Bloque> {
    return this.http.get<Bloque>(`${this.apiUrl}/${id}`);
  }

  create(bloque: Bloque): Observable<Bloque> {
    return this.http.post<Bloque>(this.apiUrl, bloque);
  }

  update(id: string, bloque: Bloque): Observable<Bloque> {
    return this.http.put<Bloque>(`${this.apiUrl}/${id}`, bloque);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
