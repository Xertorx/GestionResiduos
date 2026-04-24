import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthStateService } from './auth-state.service';
import { environment } from '../../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient, private authState: AuthStateService) {}

  private authHeaders(): HttpHeaders {
    const token = this.authState.getAccessToken();
    if (!token) return new HttpHeaders();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ─── Auth ───
  login(email: string, password: string): Observable<any> {
    return this.http.post('/auth/login', { email, password });
  }

  loginGoogle(email: string, googleId: string): Observable<any> {
    return this.http.post('/auth/login/google', { email, googleId });
  }

  registerUser(payload: any): Observable<any> {
    return this.http.post('/auth/register/user', payload);
  }

  registerGoogle(payload: any): Observable<any> {
    return this.http.post('/auth/register/google', payload);
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`/auth/verify?token=${encodeURIComponent(token)}`);
  }

  resendVerification(email: string): Observable<any> {
    return this.http.post('/auth/resend-verification', { email });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post('/auth/reset-password', { token, newPassword });
  }

  updateAuthProfile(formData: FormData): Observable<any> {
    return this.http.put('/auth/update-profile', formData, { headers: this.authHeaders() });
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post('/auth/refresh', refreshToken);
  }

  // ─── Users ───
  getUserProfile(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/users/profile`, { headers: this.authHeaders() });
  }

  updateUserProfile(formData: FormData): Observable<any> {
    return this.http.put(`${environment.apiUrl}/users/profile`, formData, { headers: this.authHeaders() });
  }

  adminListUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/users/admin/list`, { headers: this.authHeaders() });
  }

  adminGetUser(documentNumber: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/users/admin/${documentNumber}`, { headers: this.authHeaders() });
  }

  adminChangeUserStatus(documentNumber: number, status: string): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/users/admin/${documentNumber}/status`, { status }, {
      headers: this.authHeaders().set('Content-Type', 'application/json')
    });
  }

  // ─── Report Categories ───
  getReportCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/report-categories`, { headers: this.authHeaders() });
  }

  getActiveReportCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/report-categories/active`);
  }

  getReportCategoryById(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/report-categories/${id}`, { headers: this.authHeaders() });
  }

  createReportCategory(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/report-categories`, payload, { headers: this.authHeaders().set('Content-Type', 'application/json') });
  }

  updateReportCategory(id: number, payload: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/report-categories/${id}`, payload, { headers: this.authHeaders().set('Content-Type', 'application/json') });
  }

  changeReportCategoryStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/report-categories/${id}/status?status=${status}`, null, { headers: this.authHeaders() });
  }

  deleteReportCategory(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/report-categories/${id}`, { headers: this.authHeaders() });
  }

  // ─── Reports ───
  getAllReports(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/reports`, { headers: this.authHeaders() });
  }

  getMyReports(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/reports/my-reports`, { headers: this.authHeaders() });
  }

  getReportById(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/reports/${id}`, { headers: this.authHeaders() });
  }

  getPendingReports(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/reports/pending`, { headers: this.authHeaders() });
  }

  getReportsByType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/reports/type/${type}`, { headers: this.authHeaders() });
  }

  getReportsByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/reports/status/${status}`, { headers: this.authHeaders() });
  }

  changeReportStatus(id: number, newStatus: string): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/reports/${id}/status?newStatus=${newStatus}`, null, { headers: this.authHeaders() });
  }

  getReportStatistics(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/reports/statistics`, { headers: this.authHeaders() });
  }

  searchReports(filters: { status?: string; type?: string; dateFrom?: string; dateTo?: string; categoryId?: number; page?: number; size?: number }): Observable<any> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId.toString());
    if (filters.page !== undefined) params = params.set('page', filters.page.toString());
    if (filters.size !== undefined) params = params.set('size', filters.size.toString());
    return this.http.get(`${environment.apiUrl}/reports/search`, { headers: this.authHeaders(), params });
  }

  createReport(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/reports`, formData, { headers: this.authHeaders() });
  }

  // ─── Ecopoints ───
  getAllEcopoints(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/ecopoints`);
  }

  getActiveEcopoints(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/ecopoints/active`);
  }

  getEcopointById(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/ecopoints/${id}`);
  }

  getEcopointsByNeighborhood(neighborhoodId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/ecopoints/neighborhood/${neighborhoodId}`);
  }

  getActiveEcopointsByNeighborhood(neighborhoodId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/ecopoints/neighborhood/${neighborhoodId}/active`);
  }

  getEcopointsByResidueType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/ecopoints/residue-type/${type}`);
  }

  getActiveEcopointsByResidueType(type: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/ecopoints/residue-type/${type}/active`);
  }

  getEcopointsByNeighborhoodAndType(neighborhoodId: number, type: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/ecopoints/neighborhood/${neighborhoodId}/residue-type/${type}`);
  }

  getActiveEcopointsByNeighborhoodAndType(neighborhoodId: number, type: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/ecopoints/neighborhood/${neighborhoodId}/residue-type/${type}/active`);
  }

  createEcopoint(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/ecopoints`, payload, { headers: this.authHeaders().set('Content-Type', 'application/json') });
  }

  updateEcopoint(id: number, payload: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/ecopoints/${id}`, payload, { headers: this.authHeaders().set('Content-Type', 'application/json') });
  }

  changeEcopointStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/ecopoints/${id}/status?status=${status}`, null, { headers: this.authHeaders() });
  }

  deleteEcopoint(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/ecopoints/${id}`, { headers: this.authHeaders() });
  }

  // ─── Schedules (Calendario de Recolección) ───
  getSchedulesByDistrict(districtId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/schedules/district/${districtId}`);
  }

  getSchedulesByDistrictAndDay(districtId: number, day: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/schedules/district/${districtId}/day/${day}`);
  }

  createSchedule(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/schedules`, payload, { headers: this.authHeaders().set('Content-Type', 'application/json') });
  }

  updateSchedule(id: number, payload: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/schedules/${id}`, payload, { headers: this.authHeaders().set('Content-Type', 'application/json') });
  }

  changeScheduleStatus(id: number, status: string): Observable<any> {
    return this.http.patch(
      `${environment.apiUrl}/schedules/${id}/status?status=${status}`,
      null,
      { headers: this.authHeaders().set('Content-Type', 'application/json') }
    );
  }

  deleteSchedule(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/schedules/${id}`, { headers: this.authHeaders() });
  }

  // ─── Forum ───
  getActiveTopics(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/forum/topics`, { headers: this.authHeaders() });
  }

  getAllTopics(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/forum/topics/all`, { headers: this.authHeaders() });
  }

  getTopicById(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/forum/topics/${id}`, { headers: this.authHeaders() });
  }

  createTopic(payload: { titulo: string; descripcion: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/forum/topics`, payload, { headers: this.authHeaders().set('Content-Type', 'application/json') });
  }

  deleteTopic(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/forum/topics/${id}`, { headers: this.authHeaders() });
  }

  changeTopicStatus(id: number, estado: string): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/forum/topics/${id}/status`, { estado }, { headers: this.authHeaders().set('Content-Type', 'application/json') });
  }

  getTopicComments(topicId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/forum/topics/${topicId}/comments`, { headers: this.authHeaders() });
  }

  addComment(topicId: number, texto: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/forum/topics/${topicId}/comments`, { texto }, { headers: this.authHeaders().set('Content-Type', 'application/json') });
  }

  addReply(commentId: number, texto: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/forum/comments/${commentId}/replies`, { texto }, { headers: this.authHeaders().set('Content-Type', 'application/json') });
  }
}
