import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroment/enviroment';

// ── Interfaz que mapea lo que devuelve el backend ──
export interface EducationContent {
  id: number;
  title: string;
  description: string;
  fileType: string;   // "PDF", "IMAGE", "VIDEO", "OTRO"
  fileUrl: string;
  category: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class EducationService {

  private baseUrl = `${environment.apiUrl}/education`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ── Obtener el token JWT guardado en localStorage ──
  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('accessToken') || '';
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ── HU20: GET todos los contenidos educativos ──
  getAll(): Observable<EducationContent[]> {
    return this.http.get<EducationContent[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }

  // ── HU20: GET un contenido por ID ──
  getById(id: number): Observable<EducationContent> {
    return this.http.get<EducationContent>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ── HU21: POST subir nuevo contenido (multipart/form-data) ──
  create(title: string, description: string, category: string, file: File): Observable<EducationContent> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('file', file);

    // IMPORTANTE: No pongas Content-Type manualmente.
    // Angular + el navegador lo ponen automáticamente como
    // multipart/form-data con el boundary correcto.
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('accessToken') || '';
    }

    return this.http.post<EducationContent>(this.baseUrl, formData, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }

  // ── Eliminar contenido por ID ──
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }
}
