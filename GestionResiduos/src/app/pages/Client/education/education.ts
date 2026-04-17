import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { EducationService, EducationContent } from '../../../services/education.service';

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

  constructor(private educationService: EducationService) {}

  ngOnInit(): void {
    this.loadContents();
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
   * Si el backend devuelve datos, se muestran PRIMERO.
   */
  private buildGuides(): void {
    this.guides = this.backendContents.map((c) => ({
      id: c.id,
      icon: this.getIconByFileType(c.fileType),
      type: c.fileType,
      title: c.title,
      description: c.description || 'Contenido educativo sobre gestión de residuos.',
      image: c.fileType === 'IMAGE' ? c.fileUrl : `https://picsum.photos/seed/edu${c.id}/640/360`,
      time: '',
      button: this.getButtonByFileType(c.fileType),
    }));
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