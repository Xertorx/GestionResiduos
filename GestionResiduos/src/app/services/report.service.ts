import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../enviroment/enviroment';
import { AuthStateService } from './auth-state.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private baseUrl = environment.apiUrl + '/reports/stats';

  constructor(private http: HttpClient, private authState: AuthStateService) {}

  getStats(filters: any): Observable<any> {
    // startDate and endDate are required by the backend
    if (!filters?.startDate || !filters?.endDate) {
      return throwError(() => new Error('startDate and endDate are required'));
    }

    let params = new HttpParams()
      .set('startDate', filters.startDate)
      .set('endDate', filters.endDate);

    if (filters.status) params = params.set('status', filters.status);

    // Backend expects GET /api/reports/stats?startDate=...&endDate=... optionally &status=...
    const token = this.authState.getAccessToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(this.baseUrl, { params, headers });
  }

  // Opcional: obtener lista de barrios para el filtro
  getBarrios(): Observable<any[]> {
    const url = environment.apiUrl + '/barrios';
    return this.http.get<any[]>(url);
  }

  // Obtener estadísticas generales (no filtradas) — endpoint protegido para ADMIN
  getStatistics(): Observable<any> {
    // Use environment.apiUrl so it follows configured base path (/api or /api/v1)
    const url = `${environment.apiUrl}/reports/statistics`;
    const token = this.authState.getAccessToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(url, { headers });
  }
}
