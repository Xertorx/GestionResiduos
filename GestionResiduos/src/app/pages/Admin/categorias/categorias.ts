import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { AuthStateService } from '../../../services/auth-state.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table';

export interface Category {
  id: number;
  name: string;
  description: string;
  status: string;
}

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DataTableComponent],
  templateUrl: './categorias.html',
  styleUrl: './categorias.scss'
})
export class CategoriasAdmin implements OnInit {
  private readonly apiBase = '/api/report-categories';

  categories: Category[] = [];
  isLoading = false;
  error = '';

  // Columnas
  columns: TableColumn[] = [
    { key: 'id', label: 'ID', cellClass: 'text-gray-500 font-mono text-xs' },
    { key: 'name', label: 'Nombre', cellClass: 'font-medium text-gray-900' },
    { key: 'description', label: 'Descripción', cellClass: 'text-gray-600 max-w-xs truncate' },
    { key: 'status', label: 'Estado', align: 'center' },
  ];

  // Modal edición / creación
  showEditModal = false;
  isCreating = false;
  editCategory: Category = { id: 0, name: '', description: '', status: 'ACTIVO' };

  // Modal confirmación
  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  constructor(
    private http: HttpClient,
    private authState: AuthStateService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.error = '';
    this.http.get<Category[]>(this.apiBase, { headers: this.authHeaders() }).subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando categorías', err);
        this.error = 'No se pudieron cargar las categorías.';
        this.isLoading = false;
      }
    });
  }

  // — Crear —
  openCreateModal(): void {
    this.isCreating = true;
    this.editCategory = { id: 0, name: '', description: '', status: 'ACTIVO' };
    this.showEditModal = true;
  }

  // — Editar —
  openEditModal(cat: Category): void {
    this.isCreating = false;
    this.editCategory = { ...cat };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  saveCategory(): void {
    const action = this.isCreating ? 'crear' : 'actualizar';
    this.openConfirm(
      `${this.isCreating ? 'Crear' : 'Actualizar'} categoría`,
      `¿Estás seguro de ${action} la categoría "${this.editCategory.name}"?`,
      () => {
        const body = {
          name: this.editCategory.name,
          description: this.editCategory.description,
          status: this.editCategory.status
        };
        const headers = this.authHeaders().set('Content-Type', 'application/json');

        const request$ = this.isCreating
          ? this.http.post(this.apiBase, body, { headers })
          : this.http.put(`${this.apiBase}/${this.editCategory.id}`, body, { headers });

        request$.subscribe({
          next: () => {
            this.showEditModal = false;
            this.loadCategories();
          },
          error: (err) => {
            console.error(`Error al ${action} categoría`, err);
            this.error = `No se pudo ${action} la categoría.`;
          }
        });
      }
    );
  }

  // — Cambiar estado —
  toggleStatus(cat: Category): void {
    const newStatus = cat.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    this.openConfirm(
      'Cambiar estado',
      `¿Cambiar "${cat.name}" a ${newStatus}?`,
      () => {
        this.http.patch(`${this.apiBase}/${cat.id}/status?status=${newStatus}`, null, { headers: this.authHeaders() }).subscribe({
          next: () => this.loadCategories(),
          error: (err) => {
            console.error('Error al cambiar estado', err);
            this.error = 'No se pudo cambiar el estado.';
          }
        });
      }
    );
  }

  // — Eliminar —
  deleteCategory(cat: Category): void {
    this.openConfirm(
      'Eliminar categoría',
      `¿Estás seguro de eliminar "${cat.name}"? Esta acción no se puede deshacer.`,
      () => {
        this.http.delete(`${this.apiBase}/${cat.id}`, { headers: this.authHeaders() }).subscribe({
          next: () => this.loadCategories(),
          error: (err) => {
            console.error('Error al eliminar categoría', err);
            this.error = 'No se pudo eliminar la categoría.';
          }
        });
      }
    );
  }

  // — Modal de confirmación —
  openConfirm(title: string, message: string, action: () => void): void {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmAction = action;
    this.showConfirmModal = true;
  }

  confirmYes(): void {
    this.showConfirmModal = false;
    this.confirmAction?.();
  }

  confirmNo(): void {
    this.showConfirmModal = false;
    this.confirmAction = null;
  }

  private authHeaders(): HttpHeaders {
    const token = this.authState.getAccessToken();
    if (!token) return new HttpHeaders();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
