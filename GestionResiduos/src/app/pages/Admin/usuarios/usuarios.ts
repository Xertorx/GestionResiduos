import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { AuthStateService } from '../../../services/auth-state.service';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table';

export interface User {
  documentNumber: number;
  names: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: { idRole: number; name: string; description: string };
  status: string;
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, DataTableComponent],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class UsuariosAdmin implements OnInit {
  private readonly apiBase = '/user/all';

  users: User[] = [];
  isLoading = false;
  error = '';

  columns: TableColumn[] = [
    { key: 'documentNumber', label: 'Número de Documento', cellClass: 'text-gray-500 font-mono text-xs' },
    { key: 'names', label: 'Nombre' },
    { key: 'lastName', label: 'Apellido' },
    { key: 'email', label: 'Correo', cellClass: 'text-xs' },
    { key: 'phoneNumber', label: 'Teléfono', cellClass: 'text-xs' },
    { key: 'role.name', label: 'Rol', align: 'center' },
    { key: 'status', label: 'Estado', align: 'center' },
  ];

  // Detalle
  showDetailModal = false;
  selectedUser: User | null = null;

  constructor(
    private http: HttpClient,
    private authState: AuthStateService,
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
    this.http.get<User[]>(this.apiBase, { headers: this.authHeaders() }).subscribe({
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
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedUser = null;
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

  private authHeaders(): HttpHeaders {
    const token = this.authState.getAccessToken();
    if (!token) return new HttpHeaders();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
