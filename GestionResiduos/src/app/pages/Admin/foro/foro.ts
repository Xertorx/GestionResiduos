import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-admin-foro',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './foro.html',
  styleUrls: ['./foro.scss']
})
export class ForoAdmin implements OnInit {
  temas: any[] = [];
  isLoading = false;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadTopics();
  }

  loadTopics(): void {
    this.isLoading = true;
    this.error = '';
    this.api.getAllTopics().subscribe({
      next: (data) => { this.temas = data; this.isLoading = false; },
      error: () => { this.error = 'No se pudieron cargar los temas.'; this.isLoading = false; }
    });
  }

  toggleEstado(tema: any): void {
    const nuevoEstado = tema.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    this.api.changeTopicStatus(tema.id, nuevoEstado).subscribe({
      next: () => { tema.estado = nuevoEstado; },
      error: () => { this.error = 'No se pudo cambiar el estado.'; }
    });
  }

  eliminarTema(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este tema?')) return;
    this.api.deleteTopic(id).subscribe({
      next: () => { this.temas = this.temas.filter(t => t.id !== id); },
      error: () => { this.error = 'No se pudo eliminar el tema.'; }
    });
  }
}
