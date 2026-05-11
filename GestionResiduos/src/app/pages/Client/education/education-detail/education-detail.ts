import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
    videos?: string[];
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
  viewedSections: Set<string> = new Set();
  resourceCompleted: boolean = false;

  isFromBackend = false;
  backendContent: EducationContent | null = null;
  isLoading = true;

  // ── HU22: estado del quiz para este contenido ──
  hasQuiz = false;
  checkingQuiz = true;
  quizCompleted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private educationService: EducationService,
    private quizService: QuizService,
    @Inject(PLATFORM_ID) private platformId: Object
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
          this.checkQuizCompletion();
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
          this.checkQuizCompletion();
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
    // Determine primary file type from sections or top-level files
    const allFiles = content.sections?.length
      ? content.sections.flatMap(s => s.files)
      : (content.files ?? []);
    const primaryType = allFiles[0]?.fileType ?? 'OTRO';

    let sections: Resource['sections'];
    let globalImages: string[];
    let globalPdfs: { name: string; url: string }[];

    if (content.sections && content.sections.length > 0) {
      // Use real sections returned by GET /education/{id}
      sections = content.sections.map(sec => {
        const secImages = sec.files.filter(f => f.fileType === 'IMAGE').map(f => f.fileUrl);
        const secPdfs   = sec.files.filter(f => f.fileType === 'PDF').map(f => ({ name: sec.title, url: f.fileUrl }));
        const secVideos = sec.files.filter(f => f.fileType === 'VIDEO').map(f => f.fileUrl);
        const icon = sec.files[0]?.fileType
          ? this.getIconByFileType(sec.files[0].fileType)
          : this.getIconByFileType(primaryType);
        return {
          title:   sec.title,
          content: sec.description ?? sec.content ?? content.description ?? '',
          icon,
          summary: sec.description ?? sec.content ?? 'Haz clic para ver más...',
          images:  secImages,
          pdfs:    secPdfs,
          videos:  secVideos,
          topics:  []
        };
      });
      globalImages = sections.flatMap(s => s.images ?? []);
      globalPdfs   = sections.flatMap(s => s.pdfs   ?? []);
    } else {
      // Fallback: build one section from top-level files
      const files = content.files ?? [];
      globalImages = files.filter(f => f.fileType === 'IMAGE').map(f => f.fileUrl);
      globalPdfs   = files.filter(f => f.fileType === 'PDF').map(f => ({ name: content.title, url: f.fileUrl }));
      const globalVideos = files.filter(f => f.fileType === 'VIDEO').map(f => f.fileUrl);
      sections = [{
        title:   content.title,
        content: content.description ?? 'Contenido educativo subido por el administrador.',
        icon:    this.getIconByFileType(primaryType),
        summary: content.description ?? 'Haz clic para ver más...',
        images:  globalImages,
        pdfs:    globalPdfs,
        videos:  globalVideos,
        topics:  []
      }];
    }

    return {
      id:          content.id,
      title:       content.title,
      description: content.description ?? 'Contenido educativo sobre gestión de residuos.',
      type:        primaryType,
      time:        '',
      author:      'Administrador',
      date:        content.createdAt ? new Date(content.createdAt).toLocaleDateString() : '',
      images:      globalImages,
      pdfs:        globalPdfs,
      sections
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

  openModal(section: any) {
    this.selectedSection = section;
    this.viewedSections.add(section.title);
  }
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
    if (!this.canMarkCompleted) return;
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

  private checkQuizCompletion(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const id = this.resource?.id ?? this.backendContent?.id;
    if (id != null) {
      this.quizCompleted = localStorage.getItem(`quizCompleted_${id}`) === 'true';
    }
  }

  get canMarkCompleted(): boolean {
    const totalSections = this.resource?.sections?.length ?? 0;
    const allSectionsViewed = totalSections > 0 && this.viewedSections.size >= totalSections;
    const quizOk = !this.hasQuiz || this.quizCompleted;
    return allSectionsViewed && quizOk;
  }
}