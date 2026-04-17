import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../../services/api.service';

interface Schedule {
  id: number;
  districtId: number;
  districtName?: string;
  residueType: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  description: string;
  status: string;
}

@Component({
  selector: 'app-admin-calendario-recoleccion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './calendario-recoleccion.html',
  styleUrls: ['./calendario-recoleccion.scss']
})
export class CalendarioRecoleccionAdmin implements OnInit {
  schedules: Schedule[] = [];
  isLoading = false;
  error = '';

  showFormModal = false;
  showDeleteModal = false;
  isEditing = false;
  editingId: number | null = null;
  isSaving = false;
  isDeleting = false;
  deleteTarget: Schedule | null = null;

  scheduleForm!: FormGroup;

  selectedDistrictId = 1;

  districts = [
    { id: 1, name: 'Ciudad Bolívar' },
    { id: 2, name: 'Usaquén' },
    { id: 3, name: 'Chapinero' },
    { id: 4, name: 'Santa Fe' },
    { id: 5, name: 'San Cristóbal' },
    { id: 6, name: 'Usme' },
    { id: 7, name: 'Tunjuelito' },
    { id: 8, name: 'Bosa' },
    { id: 9, name: 'Kennedy' },
    { id: 10, name: 'Fontibón' },
    { id: 11, name: 'Engativá' },
    { id: 12, name: 'Suba' },
  ];

  residueTypes = ['ORGANICO', 'RECICLABLE', 'ESPECIAL', 'RCD'];
  daysOfWeek = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

  constructor(private api: ApiService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.scheduleForm = this.fb.group({
      districtId: ['', Validators.required],
      residueType: ['', Validators.required],
      dayOfWeek: ['', Validators.required],
      startTime: ['06:00', Validators.required],
      endTime: ['12:00', Validators.required],
      description: ['']
    });
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.isLoading = true;
    this.error = '';
    this.api.getSchedulesByDistrict(this.selectedDistrictId).subscribe({
      next: (data) => { this.schedules = data; this.isLoading = false; },
      error: () => { this.error = 'No se pudieron cargar los calendarios.'; this.isLoading = false; }
    });
  }

  onDistrictChange(): void {
    this.loadSchedules();
  }

  openCreateForm(): void {
    this.isEditing = false;
    this.editingId = null;
    this.scheduleForm.reset({ districtId: this.selectedDistrictId, startTime: '06:00', endTime: '12:00' });
    this.showFormModal = true;
  }

  openEditForm(s: Schedule): void {
    this.isEditing = true;
    this.editingId = s.id;
    this.scheduleForm.patchValue({
      districtId: s.districtId,
      residueType: s.residueType,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      description: s.description
    });
    this.showFormModal = true;
  }

  closeForm(): void {
    this.showFormModal = false;
  }

  saveSchedule(): void {
    if (this.scheduleForm.invalid) { this.scheduleForm.markAllAsTouched(); return; }
    this.isSaving = true;
    const v = this.scheduleForm.value;
    const payload = {
      districtId: +v.districtId,
      residueType: v.residueType,
      dayOfWeek: v.dayOfWeek,
      startTime: v.startTime,
      endTime: v.endTime,
      description: v.description || ''
    };

    const obs = this.isEditing && this.editingId
      ? this.api.updateSchedule(this.editingId, payload)
      : this.api.createSchedule(payload);

    obs.subscribe({
      next: () => { this.isSaving = false; this.showFormModal = false; this.loadSchedules(); },
      error: () => { this.isSaving = false; this.error = 'Error al guardar el calendario.'; }
    });
  }

  confirmDelete(s: Schedule): void {
    this.deleteTarget = s;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.deleteTarget = null;
  }

  executeDelete(): void {
    if (!this.deleteTarget) return;
    this.isDeleting = true;
    this.api.deleteSchedule(this.deleteTarget.id).subscribe({
      next: () => { this.isDeleting = false; this.showDeleteModal = false; this.deleteTarget = null; this.loadSchedules(); },
      error: () => { this.isDeleting = false; this.error = 'Error al eliminar el calendario.'; }
    });
  }

  changeStatus(s: Schedule, newStatus: string): void {
    this.api.changeScheduleStatus(s.id, newStatus).subscribe({
      next: () => { s.status = newStatus; },
      error: () => this.error = 'Error al cambiar el estado.'
    });
  }

  residueColor(type: string): string {
    const map: Record<string, string> = {
      ORGANICO: 'bg-emerald-50 text-emerald-700',
      RECICLABLE: 'bg-blue-50 text-blue-700',
      ESPECIAL: 'bg-indigo-50 text-indigo-700',
      RCD: 'bg-amber-50 text-amber-700'
    };
    return map[type] || 'bg-gray-50 text-gray-700';
  }

  statusColor(status: string): string {
    return status === 'ACTIVO' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700';
  }

  dayLabel(day: string): string {
    const map: Record<string, string> = {
      LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles',
      JUEVES: 'Jueves', VIERNES: 'Viernes', SABADO: 'Sábado', DOMINGO: 'Domingo'
    };
    return map[day] || day;
  }

  districtName(id: number): string {
    return this.districts.find(d => d.id === id)?.name || `Localidad ${id}`;
  }
}
