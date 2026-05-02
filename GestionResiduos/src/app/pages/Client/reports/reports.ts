import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthStateService } from '../../../services/auth-state.service';
import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';


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
  private readonly loginRequiredMessage = 'Debes iniciar sesión para crear reportes y consultar tus reportes.';
  isAuthenticated = false;
  authReady = false;
  showConfirmModal = false;
  showSuccessModal = false;

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  private readonly authSubscriptions = new Subscription();

  reportForm: any;
  formError = '';
  formSuccess = '';
  isSubmitting = false;
  isLoadingCategories = false;
  isLoadingReports = false;
  categories: ReportCategory[] = [];
  myReports: UserReport[] = [];
  listError = '';

  constructor(
    private fb: FormBuilder,
    private authState: AuthStateService,
    private api: ApiService
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

    this.api.getActiveReportCategories().subscribe({
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

    this.api.getMyReports().subscribe({
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

    this.api.createReport(formData).subscribe({
      next: (response: any) => {
        this.formSuccess = 'Reporte de punto crítico enviado correctamente.';
        this.showSuccessModal = true;
        this.resetForm();
        this.loadMyReports();
        this.isSubmitting = false;
        // ── Sistema de Logros: mostrar alerta si se desbloqueó un logro ──
        if (response.newAchievements && response.newAchievements.length > 0) {
          const a = response.newAchievements[0];
          setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: '🏆 ¡Nuevo Logro Desbloqueado!',
              html: `
                <div style="text-align:center;">
                  <p style="font-size:1.2em;font-weight:700;color:#059669;margin-bottom:4px;">${a.nombre}</p>
                  <p style="color:#6b7280;">${a.descripcion}</p>
                  <p style="margin-top:8px;font-weight:600;color:#d97706;">+${a.puntosOtorgados} puntos bonus</p>
                </div>
              `,
              confirmButtonColor: '#059669',
              confirmButtonText: '¡Genial!'
            });
          }, 1000);
        }
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