import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../../services/api.service';
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
  categories: Category[] = [];
  isLoading = false;
  error = '';

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', cellClass: 'text-gray-500 font-mono text-xs' },
    { key: 'name', label: 'Nombre', cellClass: 'font-medium text-gray-900' },
    { key: 'description', label: 'Descripción', cellClass: 'text-gray-600 max-w-xs truncate' },
    { key: 'status', label: 'Estado', align: 'center' },
  ];

  showEditModal = false;
  isCreating = false;
  editCategory: Category = { id: 0, name: '', description: '', status: 'ACTIVO' };

  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmAction: (() => void) | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.error = '';
    this.api.getReportCategories().subscribe({
      next: (data) => { this.categories = data; this.isLoading = false; },
      error: () => { this.error = 'No se pudieron cargar las categorías.'; this.isLoading = false; }
    });
  }

  openCreateModal(): void {
    this.isCreating = true;
    this.editCategory = { id: 0, name: '', description: '', status: 'ACTIVO' };
    this.showEditModal = true;
  }

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

        const request$ = this.isCreating
          ? this.api.createReportCategory(body)
          : this.api.updateReportCategory(this.editCategory.id, body);

        request$.subscribe({
          next: () => { this.showEditModal = false; this.loadCategories(); },
          error: () => { this.error = `No se pudo ${action} la categoría.`; }
        });
      }
    );
  }

  toggleStatus(cat: Category): void {
    const newStatus = cat.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    this.openConfirm(
      'Cambiar estado',
      `¿Cambiar "${cat.name}" a ${newStatus}?`,
      () => {
        this.api.changeReportCategoryStatus(cat.id, newStatus).subscribe({
          next: () => this.loadCategories(),
          error: () => { this.error = 'No se pudo cambiar el estado.'; }
        });
      }
    );
  }

  deleteCategory(cat: Category): void {
    this.openConfirm(
      'Eliminar categoría',
      `¿Estás seguro de eliminar "${cat.name}"? Esta acción no se puede deshacer.`,
      () => {
        this.api.deleteReportCategory(cat.id).subscribe({
          next: () => this.loadCategories(),
          error: () => { this.error = 'No se pudo eliminar la categoría.'; }
        });
      }
    );
  }

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
}
