import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-eco-puntos',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './eco-puntos.html',
  styleUrls: ['./eco-puntos.scss']
})
export class EcoPuntosAdmin {
  puntos = [
    { id: 1, nombre: 'Parque Central', barrio: 'Centro', direccion: 'Av. Principal 123' },
    { id: 2, nombre: 'Mercado Norte', barrio: 'Norte', direccion: 'Calle 8 #4-10' }
  ];

  editar(p: any) { alert('Editar: ' + p.nombre); }
  eliminar(p: any) { if (confirm('Eliminar punto ' + p.nombre + '?')) this.puntos = this.puntos.filter(x => x.id !== p.id); }
}
