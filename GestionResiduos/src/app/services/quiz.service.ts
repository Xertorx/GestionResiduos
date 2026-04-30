import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroment/enviroment';

// ─── Tipos ───
export interface QuizQuestionPlay {
  id: number;
  text: string;
  options: string[];
}

export interface QuizPlay {
  id: number;
  title: string;
  description: string;
  contentId: number;
  pointsPerQuestion: number;
  questions: QuizQuestionPlay[];
}

export interface QuizQuestionAdmin {
  id?: number;
  text: string;
  correctIndex: number;
  options: string[];
}

export interface QuizAdmin {
  id: number;
  title: string;
  description: string;
  contentId: number;
  pointsPerQuestion: number;
  createdAt?: string;
  questions: QuizQuestionAdmin[];
}

export interface QuizRequestPayload {
  title: string;
  description: string;
  pointsPerQuestion: number;
  questions: { text: string; correctIndex: number; options: string[] }[];
}

export interface SubmitAnswer {
  questionId: number;
  selectedIndex: number | null;
}

export interface QuizResult {
  correctAnswers: number;
  totalQuestions: number;
  pointsEarned: number;
  userTotalPoints: number;
  firstAttempt: boolean;
  perQuestion: {
    questionId: number;
    selectedIndex: number | null;
    correctIndex: number;
    wasCorrect: boolean;
  }[];
}

@Injectable({ providedIn: 'root' })
export class QuizService {
  private baseUrl = `${environment.apiV1}/quizzes`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private authHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('accessToken') || '';
    }
    if (token && token !== 'null' && token !== 'undefined') {
      return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return new HttpHeaders();
  }

  // ─── Cliente: jugar ───
  getPlayByContent(contentId: number): Observable<QuizPlay> {
    return this.http.get<QuizPlay>(`${this.baseUrl}/content/${contentId}`);
  }

  existsForContent(contentId: number): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/content/${contentId}/exists`);
  }

  submitAttempt(quizId: number, answers: SubmitAnswer[]): Observable<QuizResult> {
    return this.http.post<QuizResult>(
      `${this.baseUrl}/${quizId}/attempt`,
      { answers },
      { headers: this.authHeaders().set('Content-Type', 'application/json') }
    );
  }

  // ─── Admin ───
  getAdminByContent(contentId: number): Observable<QuizAdmin> {
    return this.http.get<QuizAdmin>(`${this.baseUrl}/content/${contentId}/admin`, {
      headers: this.authHeaders()
    });
  }

  create(contentId: number, payload: QuizRequestPayload): Observable<QuizAdmin> {
    return this.http.post<QuizAdmin>(
      `${this.baseUrl}/content/${contentId}`,
      payload,
      { headers: this.authHeaders().set('Content-Type', 'application/json') }
    );
  }

  update(quizId: number, payload: QuizRequestPayload): Observable<QuizAdmin> {
    return this.http.put<QuizAdmin>(
      `${this.baseUrl}/${quizId}`,
      payload,
      { headers: this.authHeaders().set('Content-Type', 'application/json') }
    );
  }

  delete(quizId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${quizId}`, {
      headers: this.authHeaders()
    });
  }
}