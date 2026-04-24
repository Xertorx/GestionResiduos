import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroment/enviroment';

// ── Cada archivo adjunto ──
export interface EducationFile {
  fileUrl: string;
  fileType: string; // "PDF", "IMAGE", "VIDEO", "OTRO"
}

// ── Interfaz que mapea lo que devuelve el backend ──
export interface EducationContent {
  id: number;
  title: string;
  description: string;
  category: string;
  files: EducationFile[];
  createdAt: string;
}

// ── DTO para editar (solo metadata) ──
export interface EducationUpdateDTO {
  title: string;
  description: string;
  category: string;
}

@Injectable({ providedIn: 'root' })
export class EducationService {

  // Feedback: ¿Fue útil este contenido?
  public sendFeedback(contentId: number, useful: boolean): Observable<any> {
    const url = `${this.baseUrl}/${contentId}/feedback`;
    return this.http.post(url, { useful }, { headers: this.getAuthHeaders() });
  }

  private baseUrl = `${environment.apiV1}/education`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('accessToken') || '';
    }
    // Solo enviar si el token es realmente válido
    if (token && token !== 'null' && token !== 'undefined') {
      return new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
    } else {
      return new HttpHeaders();
    }
  }

  // ── GET todos ──
  getAll(): Observable<EducationContent[]> {
    return this.http.get<EducationContent[]>(this.baseUrl);
  }

  // ── GET por id ──
  getById(id: number): Observable<EducationContent> {
    return this.http.get<EducationContent>(`${this.baseUrl}/${id}`);
  }

  // ── HU21 mejorada: POST múltiples archivos ──
  create(title: string, description: string, category: string, files: File[]): Observable<EducationContent> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    // Todos los archivos comparten la misma clave 'files' (array en backend)
    files.forEach(file => formData.append('files', file));

    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('accessToken') || '';
    }
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.post<EducationContent>(this.baseUrl, formData, {
      headers
    });
  }

  // ── NUEVO: PUT editar metadata ──
  update(id: number, dto: EducationUpdateDTO): Observable<EducationContent> {
    return this.http.put<EducationContent>(`${this.baseUrl}/${id}`, dto, {
      headers: this.getAuthHeaders().append('Content-Type', 'application/json')
    });
  }

  // ── DELETE ──
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }
}