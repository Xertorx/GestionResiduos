import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.scss']
})
export class ReportesAdmin {
  reportes = [
    { id: 1, titulo: 'Acumulación en barrio Centro', estado: 'Abierto' },
    { id: 2, titulo: 'Contenedor roto - Parque', estado: 'Resuelto' }
  ];
}
