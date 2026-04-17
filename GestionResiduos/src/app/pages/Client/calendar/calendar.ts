import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { LucideAngularModule } from 'lucide-angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule, LucideAngularModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class Calendar implements OnInit {
  calendarOptions: CalendarOptions | null = null;
  selectedDistrictId = 1;
  isLoadingSchedules = false;

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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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
        console.log('Evento:', info.event);
      }
    };
  }

  private schedulesToEvents(schedules: any[]): EventInput[] {
    const dayMap: Record<string, number> = {
      DOMINGO: 0, LUNES: 1, MARTES: 2, MIERCOLES: 3,
      JUEVES: 4, VIERNES: 5, SABADO: 6
    };
    const colorMap: Record<string, string> = {
      ORGANICO: '#059669',
      RECICLABLE: '#2563eb',
      ESPECIAL: '#6366f1',
      RCD: '#d97706'
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
            color: colorMap[s.residueType] || '#6b7280',
            extendedProps: { schedule: s }
          });
        }
        current.setDate(current.getDate() + 1);
      }
    }

    return events;
  }
}
