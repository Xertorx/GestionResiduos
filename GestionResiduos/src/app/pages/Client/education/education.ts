import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { EducationService, EducationContent } from '../../../services/education.service';
import { AuthStateService } from '../../../services/auth-state.service';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './education.html',
  styleUrls: ['./education.scss'],
})
export class Education implements OnInit {

  // ── Datos que vienen del backend ──
  backendContents: EducationContent[] = [];
  isLoading = true;
  errorMsg = '';

  // ── Datos combinados para la vista (backend + fallback local) ──
  guides: any[] = [];

  isLoggedIn = false;

  constructor(
    private educationService: EducationService,
    private authState: AuthStateService
  ) {}

  ngOnInit(): void {
    this.loadContents();
    this.authState.isLoggedIn$.subscribe((logged) => {
      this.isLoggedIn = logged;
    });
  }

  loadContents(): void {
    this.isLoading = true;
    this.educationService.getAll().subscribe({
      next: (data) => {
        this.backendContents = data;
        this.buildGuides();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando contenidos educativos:', err);
        this.errorMsg = 'No se pudieron cargar los contenidos. Mostrando datos de ejemplo.';
        this.buildGuides();
        this.isLoading = false;
      }
    });
  }

  /**
   * Combina los contenidos del backend con las tarjetas locales de ejemplo.
   * Usa el primer archivo de tipo IMAGE como portada de la tarjeta;
   * si no hay imagen, cae a un placeholder de picsum.
   */
  private buildGuides(): void {
    this.guides = this.backendContents.map((c) => {
      const primaryType = c.files?.[0]?.fileType ?? 'OTRO';
      const firstImage = c.files?.find(f => f.fileType === 'IMAGE');
      const cover = firstImage
        ? firstImage.fileUrl
        : `https://picsum.photos/seed/edu${c.id}/640/360`;

      return {
        id: c.id,
        icon: this.getIconByFileType(primaryType),
        type: primaryType,
        title: c.title,
        description: c.description || 'Contenido educativo sobre gestión de residuos.',
        image: cover,
        time: '',
        button: this.getButtonByFileType(primaryType),
      };
    });
  }

  private getIconByFileType(fileType: string): string {
    switch (fileType) {
      case 'PDF': return 'book-open';
      case 'IMAGE': return 'image';
      case 'VIDEO': return 'video';
      default: return 'file';
    }
  }

  private getButtonByFileType(fileType: string): string {
    switch (fileType) {
      case 'PDF': return 'Ver guía';
      case 'IMAGE': return 'Ver infografía';
      case 'VIDEO': return 'Ver video';
      default: return 'Ver contenido';
    }
  }

  openModal() {
    Swal.fire({
      title: 'Gracias por darnos tu opinión',
      icon: 'success',
      draggable: true
    });
  }
}