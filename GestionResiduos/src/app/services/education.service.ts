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

  private baseUrl = `${environment.apiUrl}/education`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('accessToken') || '';
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ── GET todos ──
  getAll(): Observable<EducationContent[]> {
    return this.http.get<EducationContent[]>(this.baseUrl, {
      headers: this.getAuthHeaders()
    });
  }

  // ── GET por id ──
  getById(id: number): Observable<EducationContent> {
    return this.http.get<EducationContent>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
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

    return this.http.post<EducationContent>(this.baseUrl, formData, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
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