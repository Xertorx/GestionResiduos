import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-calendario-recoleccion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario-recoleccion.html',
  styleUrls: ['./calendario-recoleccion.scss']
})
export class CalendarioRecoleccionAdmin {
  schedules = [
    { id: 1, sector: 'Centro', dia: 'Lunes', hora: '08:00 - 12:00' },
    { id: 2, sector: 'Norte', dia: 'Miércoles', hora: '13:00 - 17:00' }
  ];
}
