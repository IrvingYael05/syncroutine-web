import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

export interface VincularRequest {
  pin: string;
  userId: string;
  token: string;
  refreshToken: string;
}

export interface VinculacionStatus {
  pin: string;
  status: string;
  token?: string;
  refreshToken?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VinculacionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vinculacion`;

  vincular(request: VincularRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/vincular`, request, { responseType: 'text' });
  }

  generarPin(): Observable<VinculacionStatus> {
    return this.http.post<VinculacionStatus>(`${this.apiUrl}/generar`, {});
  }

  consultarEstado(pin: string): Observable<VinculacionStatus> {
    return this.http.get<VinculacionStatus>(`${this.apiUrl}/estado/${pin}`);
  }
}
