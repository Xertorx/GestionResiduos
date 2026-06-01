import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../../services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-foro',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './foro.html',
  styleUrls: ['./foro.scss']
})
export class ForoAdmin implements OnInit {
  temas: any[] = [];
  commentCounts: { [id: number]: number } = {};
  isLoading = false;
  error = '';

  expandedTopicId: number | null = null;
  comentariosByTopic: { [id: number]: any[] } = {};
  loadingComments: { [id: number]: boolean } = {};

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadTopics();
  }

  loadTopics(): void {
    this.isLoading = true;
    this.error = '';
    this.api.getAllTopics().subscribe({
      next: (data) => {
        this.temas = data;
        this.isLoading = false;
        if (data.length > 0) {
          const requests = data.map((t: any) => this.api.getTopicComments(t.id));
          forkJoin(requests).subscribe({
            next: (results: any[]) => {
              results.forEach((comments, i) => {
                const id = data[i].id;
                const count = Array.isArray(comments) ? comments.length : 0;
                this.commentCounts[id] = count;
                // Reusar datos si el panel ya está expandido
                if (!this.comentariosByTopic[id]) {
                  this.comentariosByTopic[id] = Array.isArray(comments) ? comments : [];
                }
              });
            },
            error: () => {}
          });
        }
      },
      error: () => { this.isLoading = false; }
    });
  }

  isActivo(estado: string): boolean {
    return estado?.toUpperCase() !== 'INACTIVO';
  }

  toggleEstado(tema: any): void {
    const nuevoEstado = this.isActivo(tema.estado) ? 'INACTIVO' : 'ACTIVO';
    this.api.changeTopicStatus(tema.id, nuevoEstado).subscribe({
      next: () => { tema.estado = nuevoEstado; },
      error: () => { this.error = 'No se pudo cambiar el estado.'; }
    });
  }

  eliminarTema(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este tema?')) return;
    this.api.deleteTopic(id).subscribe({
      next: () => {
        this.temas = this.temas.filter(t => t.id !== id);
        if (this.expandedTopicId === id) this.expandedTopicId = null;
      },
      error: () => { this.error = 'No se pudo eliminar el tema.'; }
    });
  }

  toggleComentarios(id: number): void {
    if (this.expandedTopicId === id) {
      this.expandedTopicId = null;
      return;
    }
    this.expandedTopicId = id;
    if (!this.comentariosByTopic[id]) {
      this.loadingComments[id] = true;
      this.api.getTopicComments(id).subscribe({
        next: (data) => { this.comentariosByTopic[id] = data; this.loadingComments[id] = false; },
        error: () => { this.comentariosByTopic[id] = []; this.loadingComments[id] = false; }
      });
    }
  }
}
