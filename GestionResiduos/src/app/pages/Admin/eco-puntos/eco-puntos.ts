import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../../services/api.service';

interface Ecopoint {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  status: string;
  residueTypes: string[];
  neighborhood: { neighborhoodId: number; name?: string };
  openingTime: string;
  closingTime: string;
}

@Component({
  selector: 'app-admin-eco-puntos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './eco-puntos.html',
  styleUrls: ['./eco-puntos.scss']
})
export class EcoPuntosAdmin implements OnInit {
  ecopoints: Ecopoint[] = [];
  isLoading = false;
  error = '';

  showFormModal = false;
  showDeleteModal = false;
  isEditing = false;
  editingId: number | null = null;
  isSaving = false;
  isDeleting = false;
  deleteTarget: Ecopoint | null = null;

  ecoForm!: FormGroup;

  residueTypeOptions = ['ORGANICO', 'RECICLABLE', 'ESPECIAL', 'PELIGROSO', 'ELECTRONICO'];

  constructor(private api: ApiService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.ecoForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      description: [''],
      status: ['ACTIVO', Validators.required],
      residueTypes: [[], Validators.required],
      neighborhoodId: ['', Validators.required],
      openingTime: ['08:00', Validators.required],
      closingTime: ['18:00', Validators.required]
    });
    this.loadEcopoints();
  }

  loadEcopoints(): void {
    this.isLoading = true;
    this.error = '';
    this.api.getAllEcopoints().subscribe({
      next: (data) => { this.ecopoints = data; this.isLoading = false; },
      error: (err) => { this.error = 'No se pudieron cargar los ecopuntos.'; this.isLoading = false; }
    });
  }

  openCreateForm(): void {
    this.isEditing = false;
    this.editingId = null;
    this.ecoForm.reset({ status: 'ACTIVO', residueTypes: [], openingTime: '08:00', closingTime: '18:00' });
    this.showFormModal = true;
  }

  openEditForm(ep: Ecopoint): void {
    this.isEditing = true;
    this.editingId = ep.id;
    this.ecoForm.patchValue({
      name: ep.name,
      address: ep.address,
      latitude: ep.latitude,
      longitude: ep.longitude,
      description: ep.description,
      status: ep.status,
      residueTypes: ep.residueTypes || [],
      neighborhoodId: ep.neighborhood?.neighborhoodId || '',
      openingTime: ep.openingTime || '08:00',
      closingTime: ep.closingTime || '18:00'
    });
    this.showFormModal = true;
  }

  closeForm(): void {
    this.showFormModal = false;
  }

  toggleResidueType(type: string): void {
    const current: string[] = this.ecoForm.value.residueTypes || [];
    const idx = current.indexOf(type);
    if (idx >= 0) current.splice(idx, 1); else current.push(type);
    this.ecoForm.patchValue({ residueTypes: [...current] });
  }

  isResidueSelected(type: string): boolean {
    return (this.ecoForm.value.residueTypes || []).includes(type);
  }

  saveEcopoint(): void {
    if (this.ecoForm.invalid) { this.ecoForm.markAllAsTouched(); return; }
    this.isSaving = true;

    const v = this.ecoForm.value;
    const payload = {
      name: v.name,
      address: v.address,
      latitude: +v.latitude,
      longitude: +v.longitude,
      description: v.description || '',
      status: v.status,
      residueTypes: v.residueTypes,
      neighborhood: { neighborhoodId: +v.neighborhoodId },
      openingTime: v.openingTime,
      closingTime: v.closingTime
    };

    const obs = this.isEditing && this.editingId
      ? this.api.updateEcopoint(this.editingId, payload)
      : this.api.createEcopoint(payload);

    obs.subscribe({
      next: () => { this.isSaving = false; this.showFormModal = false; this.loadEcopoints(); },
      error: (err) => { console.error('Error guardando ecopunto', err); this.isSaving = false; }
    });
  }

  confirmDelete(ep: Ecopoint): void {
    this.deleteTarget = ep;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.deleteTarget = null;
  }

  executeDelete(): void {
    if (!this.deleteTarget) return;
    this.isDeleting = true;
    this.api.deleteEcopoint(this.deleteTarget.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.deleteTarget = null;
        this.loadEcopoints();
      },
      error: (err) => { console.error('Error eliminando ecopunto', err); this.isDeleting = false; }
    });
  }

  changeStatus(ep: Ecopoint, newStatus: string): void {
    this.api.changeEcopointStatus(ep.id, newStatus).subscribe({
      next: () => { ep.status = newStatus; },
      error: (err) => console.error('Error cambiando estado', err)
    });
  }

  statusColor(status: string): string {
    return status === 'ACTIVO' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700';
  }
}
