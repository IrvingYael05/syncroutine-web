import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PerfilService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/perfiles`;

  actualizarNombre(id: string, nombre: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { id, nombre });
  }
}
