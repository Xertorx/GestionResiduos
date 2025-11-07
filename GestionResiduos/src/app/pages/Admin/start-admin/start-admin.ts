import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-start-admin',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './start-admin.html',
  styleUrls: ['./start-admin.scss']
})
export class StartAdmin {
  cards = [
    { icon: 'map-pin', title: 'Mapa de Eco-Puntos', description: 'Encuentra los puntos de recolección más cercanos.' },
    { icon: 'calendar', title: 'Calendario de Recolección', description: 'Consulta las fechas y horarios de recolección.' },
    { icon: 'alert-triangle', title: 'Reporte de Puntos Críticos', description: 'Reporta acumulaciones de residuos.' },
    { icon: 'book-open', title: 'Educación Ambiental', description: 'Aprende a separar residuos correctamente.' },
    { icon: 'trending-up', title: 'Seguimiento de Progreso', description: 'Monitorea tu impacto ambiental.' },
    { icon: 'message-square', title: 'Foro Comunitario', description: 'Comparte ideas con la comunidad.' },
  ];
  ngAfterViewInqit() {
    // Icons are rendered as Lucide components in templates; no runtime replace required.
  }
}

