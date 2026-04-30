import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CarouselComponent } from '../../../../shared/components/carousel/carousel';
import { EducationService, EducationContent } from '../../../../services/education.service';
import { QuizService } from '../../../../services/quiz.service';

export interface Resource {
  id: number;
  title: string;
  description: string;
  type?: string;
  time?: string;
  author?: string;
  date?: string;
  images?: string[];
  pdfs?: { name: string; url: string }[];
  sections?: {
    title: string;
    content: string;
    icon?: string;
    summary?: string;
    images?: string[];
    pdfs?: { name: string; url: string }[];
    topics?: { title: string; content?: string }[];
  }[];
}

@Component({
  selector: 'app-education-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, CarouselComponent],
  templateUrl: './education-detail.html',
  styleUrls: ['./education-detail.scss']
})
export class EducationDetail implements OnInit {
  resource: Resource | null = null;
  selectedSection: any = null;
  completedSections: Set<string> = new Set();
  resourceCompleted: boolean = false;

  isFromBackend = false;
  backendContent: EducationContent | null = null;
  isLoading = true;

  // ── HU22: estado del quiz para este contenido ──
  hasQuiz = false;
  checkingQuiz = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private educationService: EducationService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id) {
      this.isFromBackend = true;

      // Cargar contenido
      this.educationService.getById(id).subscribe({
        next: (content) => {
          this.backendContent = content;
          this.resource = this.mapBackendToResource(content);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error cargando contenido del backend:', err);
          this.isLoading = false;
        }
      });

      // Verificar si tiene quiz
      this.quizService.existsForContent(id).subscribe({
        next: (res) => {
          this.hasQuiz = res.exists;
          this.checkingQuiz = false;
        },
        error: () => {
          this.hasQuiz = false;
          this.checkingQuiz = false;
        }
      });
    } else {
      this.isLoading = false;
      this.checkingQuiz = false;
    }
  }

  private mapBackendToResource(content: EducationContent): Resource {
    const images = (content.files ?? [])
      .filter(f => f.fileType === 'IMAGE')
      .map(f => f.fileUrl);

    const pdfs = (content.files ?? [])
      .filter(f => f.fileType === 'PDF')
      .map(f => ({ name: content.title, url: f.fileUrl }));

    const primaryType = content.files?.[0]?.fileType ?? 'OTRO';

    return {
      id: content.id,
      title: content.title,
      description: content.description || 'Contenido educativo sobre gestión de residuos.',
      type: primaryType,
      time: '',
      author: 'Administrador',
      date: content.createdAt ? new Date(content.createdAt).toLocaleDateString() : '',
      images: images,
      pdfs: pdfs,
      sections: [
        {
          title: content.title,
          content: content.description || 'Contenido educativo subido por el administrador.',
          icon: this.getIconByFileType(primaryType),
          summary: content.description || 'Haz clic para ver más...',
          images: images,
          pdfs: pdfs,
          topics: []
        }
      ]
    };
  }

  private getIconByFileType(fileType: string): string {
    switch (fileType) {
      case 'PDF': return 'book-open';
      case 'IMAGE': return 'image';
      case 'VIDEO': return 'video';
      default: return 'file-text';
    }
  }

  goToQuiz(): void {
    if (!this.resource) return;
    this.router.navigate(['/education', this.resource.id, 'quiz']);
  }

  openModal(section: any) { this.selectedSection = section; }
  closeModal() { this.selectedSection = null; }
  selectSection(section: any) { this.selectedSection = section; }
  selectTopic(_topic: any) {}

  toggleSectionCompleted(section: any): void {
    const sectionId = section.title;
    if (this.completedSections.has(sectionId)) {
      this.completedSections.delete(sectionId);
    } else {
      this.completedSections.add(sectionId);
    }
  }

  isSectionCompleted(section: any): boolean {
    return this.completedSections.has(section.title);
  }

  toggleResourceCompleted(): void {
    this.resourceCompleted = !this.resourceCompleted;
    if (this.resourceCompleted && this.resource?.sections) {
      this.resource.sections.forEach(section => this.completedSections.add(section.title));
    } else {
      this.completedSections.clear();
    }
  }

  isResourceCompleted(): boolean {
    return this.resourceCompleted;
  }
}