
import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { LucideAngularModule } from 'lucide-angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthStateService } from '../../../services/auth-state.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule, LucideAngularModule, ReactiveFormsModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})

export class Calendar implements OnInit {
  calendarOptions: CalendarOptions | null = null;
  selectedDistrictId = 1;
  isLoadingSchedules = false;
  showPreviewModal = false;
  selectedEvent: any = null;

  // Estados y datos para el reporte de incumplimiento
  showNonComplianceModal = false;
  showNonComplianceConfirmModal = false;
  showNonComplianceSuccessModal = false;
  isSubmittingNonCompliance = false;
  nonComplianceForm: FormGroup;
  nonComplianceCategories: any[] = [];
  nonComplianceFormError = '';
  selectedCalendarId: number | null = null;

  // Autenticación
  isAuthenticated = false;
  authReady = false;

  districts = [
    { id: 1, name: 'Ciudad Bolívar' },
    { id: 2, name: 'Usaquén' },
    { id: 3, name: 'Chapinero' },
    { id: 4, name: 'Santa Fe' },
    { id: 5, name: 'San Cristóbal' },
    { id: 6, name: 'Usme' },
    { id: 7, name: 'Tunjuelito' },
    { id: 8, name: 'Bosa' },
    { id: 9, name: 'Kennedy' },
    { id: 10, name: 'Fontibón' },
    { id: 11, name: 'Engativá' },
    { id: 12, name: 'Suba' },
  ];

  private dayGridPlugin: any;
  private interactionPlugin: any;

  constructor(
    private router: Router,
    private api: ApiService,
    private fb: FormBuilder,
    private authState: AuthStateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.nonComplianceForm = this.fb.group({
      categoryId: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const [
        { default: dayGridPlugin },
        { default: interactionPlugin }
      ] = await Promise.all([
        import('@fullcalendar/daygrid'),
        import('@fullcalendar/interaction')
      ]);
      this.dayGridPlugin = dayGridPlugin;
      this.interactionPlugin = interactionPlugin;

      this.initCalendar([]);
      this.loadSchedules();

      // Suscribirse a autenticación
      this.authState.isLoggedIn$.subscribe((isLoggedIn) => {
        this.isAuthenticated = isLoggedIn;
      });
      this.authState.initialized$.subscribe((isReady) => {
        this.authReady = isReady;
      });

      // Cargar categorías para el reporte de incumplimiento
      this.api.getActiveReportCategories().subscribe({
        next: (categories) => {
          this.nonComplianceCategories = categories;
        },
        error: () => {
          this.nonComplianceCategories = [];
        }
      });
    }
  }

  onDistrictChange(): void {
    this.loadSchedules();
  }

  private loadSchedules(): void {
    this.isLoadingSchedules = true;
    this.api.getSchedulesByDistrict(this.selectedDistrictId).subscribe({
      next: (schedules) => {
        const events = this.schedulesToEvents(schedules);
        this.initCalendar(events);
        this.isLoadingSchedules = false;
      },
      error: () => {
        this.initCalendar([]);
        this.isLoadingSchedules = false;
      }
    });
  }

  private initCalendar(events: EventInput[]): void {
    const today = new Date();
    this.calendarOptions = {
      plugins: [this.dayGridPlugin, this.interactionPlugin],
      initialView: 'dayGridMonth',
      locale: 'es',
      height: '500px',
      headerToolbar: {
        left: 'prevYear,prev,next,nextYear today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek'
      },
      events,
      eventClick: (info) => {
        this.onEventClick(info.event);
      },
      initialDate: today,
      nowIndicator: true
    };
  }


  onEventClick(event: any) {
    this.selectedEvent = event;
    this.showPreviewModal = true;
  }

  // --- Reporte de Incumplimiento ---
  openNonComplianceModal(event: any) {
    this.showNonComplianceModal = true;
    this.nonComplianceForm.reset();
    this.nonComplianceFormError = '';
    // Guardar calendarId del evento
    this.selectedCalendarId = event.extendedProps?.id || null;
  }

  closeNonComplianceModal() {
    this.showNonComplianceModal = false;
    this.nonComplianceFormError = '';
    this.selectedCalendarId = null;
  }

  submitNonComplianceReport() {
    this.nonComplianceFormError = '';
    if (!this.isAuthenticated) {
      this.nonComplianceFormError = 'Debes iniciar sesión para reportar.';
      return;
    }
    if (this.nonComplianceForm.invalid) {
      this.nonComplianceForm.markAllAsTouched();
      this.nonComplianceFormError = 'Completa todos los campos obligatorios.';
      return;
    }
    if (!this.selectedCalendarId) {
      this.nonComplianceFormError = 'No se pudo obtener el calendario del evento.';
      return;
    }
    this.showNonComplianceConfirmModal = true;
  }

  cancelNonComplianceConfirm() {
    this.showNonComplianceConfirmModal = false;
  }

  confirmNonComplianceSubmission() {
    this.showNonComplianceConfirmModal = false;
    this.isSubmittingNonCompliance = true;
    const value = this.nonComplianceForm.getRawValue();
    const formData = new FormData();
    formData.append('type', 'incumplimiento_calendario');
    formData.append('categoryId', value.categoryId || '');
    formData.append('description', value.description || '');
    formData.append('calendarId', String(this.selectedCalendarId));
    // No enviar latitude ni longitude para este tipo de reporte
    this.api.createReport(formData).subscribe({
      next: () => {
        this.isSubmittingNonCompliance = false;
        this.showNonComplianceModal = false;
        this.showNonComplianceSuccessModal = true;
        this.nonComplianceForm.reset();
        this.selectedCalendarId = null;
      },
      error: (error) => {
        this.isSubmittingNonCompliance = false;
        this.nonComplianceFormError = error?.error?.message || 'No se pudo enviar el reporte.';
      }
    });
  }

  closeNonComplianceSuccessModal() {
    this.showNonComplianceSuccessModal = false;
  }

  closePreviewModal() {
    this.showPreviewModal = false;
    this.selectedEvent = null;
  }

  private schedulesToEvents(schedules: any[]): EventInput[] {
    const dayMap: Record<string, number> = {
      DOMINGO: 0, LUNES: 1, MARTES: 2, MIERCOLES: 3,
      JUEVES: 4, VIERNES: 5, SABADO: 6
    };
    // Verde institucional y variantes
    const colorMap: Record<string, string> = {
      ORGANICO: '#059669', // verde principal
      RECICLABLE: '#10b981', // verde claro
      ESPECIAL: '#047857', // verde oscuro
      RCD: '#059669' // igual a orgánico, sin amarillo
    };

    const events: EventInput[] = [];
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);

    for (const s of schedules) {
      if (s.status && s.status !== 'ACTIVO') continue;
      const targetDay = dayMap[s.dayOfWeek];
      if (targetDay === undefined) continue;

      const current = new Date(start);
      while (current <= end) {
        if (current.getDay() === targetDay) {
          const dateStr = current.toISOString().slice(0, 10);
          events.push({
            title: `${s.residueType} (${s.startTime} - ${s.endTime})`,
            date: dateStr,
            backgroundColor: colorMap[s.residueType] || '#059669',
            borderColor: '#047857',
            textColor: '#fff',
            extendedProps: {
              ...s,
              startTime: s.startTime,
              endTime: s.endTime,
              residueType: s.residueType,
              description: s.description
            }
          });
        }
        current.setDate(current.getDate() + 1);
      }
    }

    return events;
  }
}
