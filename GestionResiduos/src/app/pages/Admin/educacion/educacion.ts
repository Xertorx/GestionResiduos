import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-educacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './educacion.html',
  styleUrls: ['./educacion.scss']
})
export class EducacionAdmin {
  contenidos = [
    { id: 1, titulo: 'Guía de Separación', tipo: 'PDF' },
    { id: 2, titulo: 'Video Compostaje', tipo: 'Video' }
  ];
}
