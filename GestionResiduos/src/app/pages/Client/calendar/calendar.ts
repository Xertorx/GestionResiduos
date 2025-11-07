import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { LucideAngularModule } from 'lucide-angular';
import { CalendarOptions } from '@fullcalendar/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, LucideAngularModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class Calendar implements OnInit {
  calendarOptions: CalendarOptions | null = null;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private async initializeCalendar() {
    if (isPlatformBrowser(this.platformId)) {
      const [
        { default: dayGridPlugin },
        { default: interactionPlugin },
        { default: googleCalendarPlugin }
      ] = await Promise.all([
        import('@fullcalendar/daygrid'),
        import('@fullcalendar/interaction'),
        import('@fullcalendar/google-calendar')
      ]);

      this.calendarOptions = {
        plugins: [dayGridPlugin, interactionPlugin, googleCalendarPlugin],
        initialView: 'dayGridMonth',
        locale: 'es',
        height: '500px',
      
        headerToolbar: {
          left: 'prevYear,prev,next,nextYear today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        },
        events: [
          {
            title: 'Recolección Orgánica',
            date: "2025-09-25"
            
          }
        ],
        eventClick: (info) => {
          console.log('Evento:', info.event);
        },
        dateClick: (info) => {
          console.log('Fecha clickeada:', info.date);
        }
      };
    }
  }

  async ngOnInit() {
    await this.initializeCalendar();
  }
}
