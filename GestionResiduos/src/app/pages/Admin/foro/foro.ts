import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-foro',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './foro.html',
  styleUrls: ['./foro.scss']
})
export class ForoAdmin {
  temas = [
    { id: 1, titulo: 'Cómo separar los residuos correctamente', comentarios: 3 },
    { id: 2, titulo: 'Ideas para reciclar en casa', comentarios: 5 }
  ];
}
