import { Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { AuthStateService } from '../../../services/auth-state.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table';

export interface Report {
  id: number;
  type: string;
  status: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  categoryId: number;
  categoryName: string;
  calendarId: number | null;
  userId: number;
  userName: string;
}

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DataTableComponent],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.scss']
})
export class ReportesAdmin implements OnInit {
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent;

  private readonly apiBase = '/api/reports';

  reports: Report[] = [];
  isLoading = false;
  error = '';

  // Columnas
  columns: TableColumn[] = [
    { key: 'id', label: 'ID', cellClass: 'text-gray-500 font-mono text-xs' },
    { key: 'type', label: 'Tipo' },
    { key: 'categoryName', label: 'Categoría' },
    { key: 'userName', label: 'Usuario', cellClass: 'text-xs' },
    { key: 'createdAt', label: 'Fecha', cellClass: 'text-gray-500 text-xs' },
    { key: 'status', label: 'Estado', align: 'center' },
  ];

  // Filtro
  statusFilter = '';
  statuses = ['pendiente', 'en_revision', 'resuelto', 'rechazado'];

  // Modal detalle
  showDetailModal = false;
  selectedReport: Report | null = null;

  // Cambio de estado
  newStatus = '';
  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  // HU27: Modal de confirmación de notificación enviada al ciudadano
  showNotificationSentModal = false;
  notificationMessage = '';

  constructor(
    private http: HttpClient,
    private authState: AuthStateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadReports();
    }
  }

  loadReports(): void {
    this.isLoading = true;
    this.error = '';

    const url = this.statusFilter
      ? `${this.apiBase}/status/${this.statusFilter}`
      : this.apiBase;

    this.http.get<Report[]>(url, { headers: this.authHeaders() }).subscribe({
      next: (data) => {
        this.reports = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando reportes', err);
        this.error = 'No se pudieron cargar los reportes.';
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    if (this.dataTable) this.dataTable.currentPage = 1;
    this.loadReports();
  }

  // — Modal detalle —
  openDetail(report: Report): void {
    this.selectedReport = report;
    this.newStatus = report.status;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedReport = null;
  }

  // — Cambiar estado —
  requestStatusChange(): void {
    if (!this.selectedReport || this.newStatus === this.selectedReport.status) return;

    this.openConfirm(
      'Cambiar estado',
      `¿Cambiar el estado del reporte #${this.selectedReport.id} de "${this.formatStatus(this.selectedReport.status)}" a "${this.formatStatus(this.newStatus)}"?`,
      () => {
        const targetStatus = this.newStatus;
        const ciudadano = this.selectedReport!.userName || 'el ciudadano';
        this.http.patch(
          `${this.apiBase}/${this.selectedReport!.id}/status?newStatus=${targetStatus}`,
          null,
          { headers: this.authHeaders() }
        ).subscribe({
          next: () => {
            this.selectedReport!.status = targetStatus;
            this.loadReports();

            // HU27: Mostrar modal confirmando que se envió la notificación
            this.notificationMessage = `Se envió un correo a ${ciudadano} notificando el nuevo estado: "${this.formatStatus(targetStatus)}".`;
            this.showNotificationSentModal = true;
            this.closeDetail();
          },
          error: (err) => {
            console.error('Error al cambiar estado', err);
            this.error = 'No se pudo cambiar el estado del reporte.';
          }
        });
      }
    );
  }

  // HU27: Cerrar modal de notificación enviada
  closeNotificationSentModal(): void {
    this.showNotificationSentModal = false;
    this.notificationMessage = '';
  }

  // — Modal confirmación —
  openConfirm(title: string, message: string, action: () => void): void {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmAction = action;
    this.showConfirmModal = true;
  }

  confirmYes(): void {
    this.showConfirmModal = false;
    this.confirmAction?.();
  }

  confirmNo(): void {
    this.showConfirmModal = false;
    this.confirmAction = null;
  }

  // — Helpers —
  formatStatus(status: string): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente',
      en_revision: 'En revisión',
      resuelto: 'Resuelto',
      rechazado: 'Rechazado'
    };
    return map[status] || status;
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      pendiente: 'bg-yellow-50 text-yellow-700',
      en_revision: 'bg-blue-50 text-blue-700',
      resuelto: 'bg-emerald-50 text-emerald-700',
      rechazado: 'bg-red-50 text-red-700'
    };
    return map[status] || 'bg-gray-50 text-gray-700';
  }

  statusDot(status: string): string {
    const map: Record<string, string> = {
      pendiente: 'bg-yellow-500',
      en_revision: 'bg-blue-500',
      resuelto: 'bg-emerald-500',
      rechazado: 'bg-red-500'
    };
    return map[status] || 'bg-gray-500';
  }

  formatDate(dateValue: string): string {
    if (!dateValue) return 'Sin fecha';
    const parsed = new Date(dateValue);
    if (isNaN(parsed.getTime())) return dateValue;
    return parsed.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatType(type: string): string {
    if (type === 'punto_critico') return 'Punto crítico';
    if (type === 'incumplimiento_calendario') return 'Incumplimiento';
    return type;
  }

  private authHeaders(): HttpHeaders {
    const token = this.authState.getAccessToken();
    if (!token) return new HttpHeaders();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}