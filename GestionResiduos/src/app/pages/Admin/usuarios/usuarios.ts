import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../../services/api.service';

export interface User {
  documentNumber: number;
  names: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  photo: string;
  role: { idRole: number; name: string; description: string };
  status: string;
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class UsuariosAdmin implements OnInit {

  users: User[] = [];
  isLoading = false;
  error = '';

  showDetailModal = false;
  selectedUser: any = null;
  selectedUserDetail: any = null;
  isLoadingDetail = false;
  isChangingStatus = false;

  constructor(
    private api: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUsers();
    }
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = '';
    this.api.adminListUsers().subscribe({
      next: (data) => {
        this.users = Array.isArray(data) ? data : [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.error = 'No se pudieron cargar los usuarios.';
        this.isLoading = false;
      }
    });
  }

  openDetail(user: User): void {
    this.selectedUser = user;
    this.showDetailModal = true;
    this.isLoadingDetail = true;
    this.selectedUserDetail = null;

    this.api.adminGetUser(user.documentNumber).subscribe({
      next: (detail) => {
        this.selectedUserDetail = detail;
        this.isLoadingDetail = false;
      },
      error: (err) => {
        console.error('Error cargando detalle de usuario', err);
        this.isLoadingDetail = false;
      }
    });
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedUser = null;
    this.selectedUserDetail = null;
  }

  changeUserStatus(newStatus: string): void {
    if (!this.selectedUser) return;
    this.isChangingStatus = true;

    this.api.adminChangeUserStatus(this.selectedUser.documentNumber, newStatus).subscribe({
      next: () => {
        this.isChangingStatus = false;
        if (this.selectedUser) this.selectedUser.status = newStatus;
        if (this.selectedUserDetail) this.selectedUserDetail.status = newStatus;
        const idx = this.users.findIndex(u => u.documentNumber === this.selectedUser?.documentNumber);
        if (idx >= 0) this.users[idx].status = newStatus;
      },
      error: (err) => {
        console.error('Error cambiando estado', err);
        this.isChangingStatus = false;
      }
    });
  }

  roleColor(role: any): string {
    const name = typeof role === 'string' ? role : role?.name;
    if (name === 'ADMINISTRADOR') return 'bg-purple-50 text-purple-700';
    return 'bg-sky-50 text-sky-700';
  }

  statusColor(status: string): string {
    if (status === 'ACTIVO' || status === 'activo') return 'bg-emerald-50 text-emerald-700';
    return 'bg-red-50 text-red-700';
  }

  statusDot(status: string): string {
    if (status === 'ACTIVO' || status === 'activo') return 'bg-emerald-500';
    return 'bg-red-500';
  }
}
