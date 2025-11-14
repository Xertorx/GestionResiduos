import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss']
})
export class UsuariosAdmin {
  usuarios = [
    { id: 1, nombre: 'María Perez', correo: 'maria@example.com', rol: 'Usuario' },
    { id: 2, nombre: 'Carlos López', correo: 'carlos@example.com', rol: 'Moderador' }
  ];

  buscar = '';

  editar(u: any) {
    // placeholder: abrir modal de edición
    alert(`Editar usuario: ${u.nombre}`);
  }

  eliminar(u: any) {
    if (confirm(`Eliminar a ${u.nombre}?`)) {
      this.usuarios = this.usuarios.filter(x => x.id !== u.id);
    }
  }
}
