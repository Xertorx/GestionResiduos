import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthStateService } from '../../../services/auth-state.service';

interface ReportCategory {
  id: number;
  name: string;
  description?: string;
  status?: string;
}

interface UserReport {
  id: number;
  type: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;     // HU27: fecha de última actualización (viene del backend)
  categoryName: string;
  locationLabel: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class Reports implements OnInit, OnDestroy {
  private readonly apiBase = '/api';

  reportForm;

  categories: ReportCategory[] = [];
  myReports: UserReport[] = [];
  isSubmitting = false;
  isLoadingReports = false;
  isLoadingCategories = false;
  formSuccess = '';
  formError = '';
  listError = '';
  loginRequiredMessage = 'Debes iniciar sesión para crear reportes y consultar tus reportes.';
  isAuthenticated = false;
  authReady = false;
  showConfirmModal = false;
  showSuccessModal = false;

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  private readonly authSubscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authState: AuthStateService
  ) {
    this.reportForm = this.fb.group({
      categoryId: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]]
    });
    this.reportForm.disable({ emitEvent: false });
  }

  ngOnInit(): void {
    this.authSubscriptions.add(
      this.authState.isLoggedIn$.subscribe((isLoggedIn) => {
        const authChanged = this.isAuthenticated !== isLoggedIn;
        this.isAuthenticated = isLoggedIn;
        this.applyFormAuthState();

        if (!this.authReady) {
          return;
        }

        if (!this.isAuthenticated) {
          this.myReports = [];
          this.listError = '';
          this.isLoadingReports = false;
          return;
        }

        if (authChanged) {
          this.loadMyReports();
        }
      })
    );

    this.authSubscriptions.add(
      this.authState.initialized$.subscribe((isReady) => {
        const becameReady = !this.authReady && isReady;
        this.authReady = isReady;
        this.applyFormAuthState();

        if (becameReady) {
          this.loadMyReports();
        }
      })
    );

    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.authSubscriptions.unsubscribe();
  }

  get filteredCategories(): ReportCategory[] {
    return this.categories;
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.formError = '';

    this.http.get<ReportCategory[]>(`${this.apiBase}/report-categories/active`).subscribe({
      next: (categories) => {
        this.categories = categories;
        this.reportForm.patchValue({ categoryId: '' }, { emitEvent: false });
        this.isLoadingCategories = false;
      },
      error: (error) => {
        console.error('Error cargando categorías activas', error);
        this.formError = this.toConnectionMessage(error, 'No se pudieron cargar las categorías activas.');
        this.isLoadingCategories = false;
      }
    });
  }

  loadMyReports(): void {
    if (!this.isAuthenticated) {
      this.myReports = [];
      this.listError = '';
      this.isLoadingReports = false;
      return;
    }

    this.isLoadingReports = true;
    this.listError = '';

    this.http.get<UserReport[]>(`${this.apiBase}/reports/my-reports`, { headers: this.buildAuthHeaders() }).subscribe({
      next: (reports) => {
        this.myReports = reports;
        this.isLoadingReports = false;
      },
      error: (error) => {
        console.error('Error al obtener mis reportes', error);
        this.listError = this.toConnectionMessage(error, 'No se pudieron cargar tus reportes.');
        this.isLoadingReports = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.formError = 'Solo se permiten archivos de imagen.';
      return;
    }

    this.formError = '';
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    const input = document.getElementById('report-file') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  submitReport(): void {
    this.formSuccess = '';
    this.formError = '';

    if (!this.isAuthenticated) {
      this.formError = this.loginRequiredMessage;
      return;
    }

    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      this.formError = 'Completa los campos obligatorios para enviar el reporte.';
      return;
    }

    if (!this.selectedFile) {
      this.formError = 'Para punto crítico debes adjuntar una imagen.';
      return;
    }

    this.showConfirmModal = true;
  }

  cancelReportConfirmation(): void {
    this.showConfirmModal = false;
  }

  confirmReportSubmission(): void {
    this.showConfirmModal = false;
    const formData = this.buildReportFormData();
    this.isSubmitting = true;

    this.http.post(`${this.apiBase}/reports`, formData, { headers: this.buildAuthHeaders() }).subscribe({
      next: () => {
        this.formSuccess = 'Reporte de punto crítico enviado correctamente.';
        this.showSuccessModal = true;
        this.resetForm();
        this.loadMyReports();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error al enviar reporte', error);
        this.formError = this.toConnectionMessage(error, error?.error?.message || 'No se pudo enviar el reporte.');
        this.isSubmitting = false;
      }
    });
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }

  private toConnectionMessage(error: any, fallbackMessage: string): string {

    if (error?.status === 401 || error?.status === 403) {
      return this.loginRequiredMessage;
    }

    return fallbackMessage;
  }

  private applyFormAuthState(): void {
    if (this.authReady && this.isAuthenticated) {
      this.reportForm.enable({ emitEvent: false });
      return;
    }

    this.reportForm.disable({ emitEvent: false });
  }

  private resetForm(): void {
    const currentCategory = this.reportForm.get('categoryId')?.value || '';
    this.clearSelectedFile();
    this.reportForm.reset({
      categoryId: currentCategory,
      description: '',
      latitude: '',
      longitude: ''
    });
  }

  private buildReportFormData(): FormData {
    const value = this.reportForm.getRawValue();
    const formData = new FormData();

    formData.append('type', 'punto_critico');
    formData.append('categoryId', value.categoryId || '');
    formData.append('description', value.description || '');
    formData.append('latitude', value.latitude || '');
    formData.append('longitude', value.longitude || '');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    return formData;
  }

  private buildAuthHeaders(): HttpHeaders {
    const token = this.authState.getAccessToken();
    if (!token) return new HttpHeaders();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  formatDate(dateValue: string): string {
    if (!dateValue) return 'Sin fecha';

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return dateValue;

    return parsed.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * HU27: Indica si el reporte tuvo una actualización de estado posterior a la creación.
   * Se usa para mostrar la notita "Actualizado el..." en la tarjeta.
   */
  wasUpdated(report: UserReport): boolean {
    if (!report.updatedAt || !report.createdAt) return false;
    const created = new Date(report.createdAt).getTime();
    const updated = new Date(report.updatedAt).getTime();
    return updated - created > 1000;
  }

  /**
   * HU27: Formatear fecha con formato legible (para la fecha de actualización)
   */
  formatDateTime(dateValue: string): string {
    if (!dateValue) return 'Sin fecha';
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return dateValue;
    return parsed.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  statusBadgeClasses(status: string): string {
    const normalized = status.toLowerCase();

    if (normalized.includes('resuelto') || normalized.includes('cerrado')) {
      return 'bg-green-100 text-green-800';
    }

    if (normalized.includes('proceso') || normalized.includes('atend') || normalized.includes('revision')) {
      return 'bg-blue-100 text-blue-800';
    }

    if (normalized.includes('rechazado')) {
      return 'bg-red-100 text-red-800';
    }

    return 'bg-yellow-100 text-yellow-800';
  }

  typeLabel(type: string): string {
    if (type === 'punto_critico') return 'Punto crítico';
    return type;
  }
}