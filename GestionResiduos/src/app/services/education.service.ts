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

// ── Cada sección de un contenido (viene en GET /education/{id}) ──
export interface EducationSection {
  id?: number;
  title: string;
  description?: string;
  content?: string;
  files: EducationFile[];
}

// ── Interfaz que mapea lo que devuelve el backend ──
export interface EducationContent {
  id: number;
  title: string;
  description: string;
  category: string;
  files: EducationFile[];
  sections?: EducationSection[];
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

  // ── GET todos (público, sin token) ──
  getAll(): Observable<EducationContent[]> {
    return this.http.get<EducationContent[]>(this.baseUrl);
  }

  // ── GET por id (público, sin token) ──
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

  // ── NUEVO: PUT editar (multipart para soportar archivos nuevos) ──
  update(id: number, dto: EducationUpdateDTO, newFiles: File[] = []): Observable<EducationContent> {
    const formData = new FormData();
    formData.append('title', dto.title);
    formData.append('description', dto.description);
    formData.append('category', dto.category);
    newFiles.forEach(file => formData.append('files', file));
    // Dejar que el navegador establezca el Content-Type con el boundary correcto
    return this.http.put<EducationContent>(`${this.baseUrl}/${id}`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  // ── POST sección a un contenido existente ──
  addSection(contentId: number, title: string, description: string, files: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    files.forEach(file => formData.append('files', file));
    return this.http.post(`${this.baseUrl}/${contentId}/sections`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  // ── PUT actualizar sección (multipart; si se envían files reemplaza los anteriores) ──
  updateSection(sectionId: number, title: string, description: string, files: File[] = []): Observable<any> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    files.forEach(file => formData.append('files', file));
    return this.http.put(
      `${this.baseUrl}/sections/${sectionId}`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  // ── DELETE eliminar sección ──
  deleteSection(contentId: number, sectionId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${contentId}/sections/${sectionId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  // ── POST añadir archivos a contenido existente ──
  addFilesToContent(contentId: number, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post(`${this.baseUrl}/${contentId}/files`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  // ── POST añadir archivos a sección existente ──
  addFilesToSection(contentId: number, sectionId: number, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post(`${this.baseUrl}/${contentId}/sections/${sectionId}/files`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  // ── DELETE ──
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    });
  }

  // ── PROGRESO ──
  getProgress(contentId: number): Observable<ContentProgress> {
    return this.http.get<ContentProgress>(`${this.baseUrl}/${contentId}/progress`, {
      headers: this.getAuthHeaders()
    });
  }

  completeSectionProgress(contentId: number, sectionId: number): Observable<SectionProgress> {
    return this.http.post<SectionProgress>(
      `${this.baseUrl}/${contentId}/sections/${sectionId}/complete`,
      null,
      { headers: this.getAuthHeaders() }
    );
  }

  completeContent(contentId: number): Observable<ContentProgress> {
    return this.http.post<ContentProgress>(
      `${this.baseUrl}/${contentId}/complete`,
      null,
      { headers: this.getAuthHeaders() }
    );
  }
}

// ── Interfaces de progreso ──
export interface SectionProgress {
  sectionId: number;
  sectionTitle: string;
  completed: boolean;
  completedAt: string | null;
}

export interface ContentProgress {
  contentId: number;
  contentTitle: string;
  contentCompleted: boolean;
  totalSections: number;
  completedSections: number;
  progressPercentage: number;
  sections: SectionProgress[];
}