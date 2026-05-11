import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-seguimiento',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './seguimiento.html',
  styleUrls: ['./seguimiento.scss']
})
export class SeguimientoAdmin {
  metrics = [
    { id: 1, etiqueta: 'Usuarios activos', valor: 123 },
    { id: 2, etiqueta: 'Eco-puntos activos', valor: 45 }
  ];
}
