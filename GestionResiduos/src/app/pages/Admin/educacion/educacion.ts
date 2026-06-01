import { Component, OnInit } from '@angular/core';
import { AuthStateService } from '../../../services/auth-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { EducationService, EducationContent, EducationFile } from '../../../services/education.service';
import {
  QuizService,
  QuizAdmin,
  QuizRequestPayload
} from '../../../services/quiz.service';
import Swal from 'sweetalert2';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface DraftQuestion {
  text: string;
  correctIndex: number;
  options: string[];
}

interface DraftSection {
  title: string;
  description: string;
  files: File[];
}

interface ExistingSection {
  id: number;
  title: string;
  description: string;
  existingFiles: EducationFile[];
  newFiles: File[];
  markedForDelete: boolean;
}

@Component({
  selector: 'app-admin-educacion',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './educacion.html',
  styleUrls: ['./educacion.scss']
})
export class EducacionAdmin implements OnInit {
  isAuthenticated = false;

  contenidos: EducationContent[] = [];
  isLoading = true;

  // ── Form contenido ──
  showForm = false;
  isSubmitting = false;
  isEditMode = false;
  editingId: number | null = null;

  // Wizard steps: 1=datos básicos, 2=secciones, 3=quiz
  wizardStep = 1;

  newTitle = '';
  newDescription = '';
  newCategory = 'reciclaje';
  selectedFiles: File[] = [];

  // ── Edit mode additional state ──
  existingSections: ExistingSection[] = [];
  newContentFiles: File[] = [];
  editContentCurrentFiles: EducationFile[] = [];
  includeQuizInEdit = false;

  // ── Portada e imágenes de galería (create mode) ──
  coverImageFile: File | null = null;
  coverImagePreviewUrl: string | null = null;
  galleryFiles: File[] = [];
  galleryPreviews: string[] = [];

  // ── Portada e imágenes de galería (edit mode) ──
  newCoverImageFile: File | null = null;
  newCoverImagePreviewUrl: string | null = null;
  newGalleryFiles: File[] = [];
  newGalleryPreviews: string[] = [];

  // Estado de carga del detalle en modo edición
  isLoadingEditData = false;

  // ── Secciones del wizard ──
  draftSections: DraftSection[] = [];

  // ── Quiz integrado en el wizard de creación ──
  includeQuizInCreate = false;

  categories = [
    { value: 'reciclaje', label: 'Reciclaje' },
    { value: 'compostaje', label: 'Compostaje' },
    { value: 'residuos_peligrosos', label: 'Residuos Peligrosos' },
    { value: 'economia_circular', label: 'Economía Circular' },
    { value: 'huella_ecologica', label: 'Huella Ecológica' },
    { value: 'otro', label: 'Otro' }
  ];

  // ─────────── HU22: estado del Form de Quiz ───────────
  showQuizForm = false;
  quizForContentId: number | null = null;
  isQuizEditMode = false;
  editingQuizId: number | null = null;
  isSubmittingQuiz = false;

  quizTitle = '';
  quizDescription = '';
  quizPointsPerQuestion = 10;
  draftQuestions: DraftQuestion[] = [];

  // Cache: contentId -> tieneQuiz?
  contentHasQuiz: { [contentId: number]: boolean } = {};

  constructor(
    private educationService: EducationService,
    private quizService: QuizService,
    private authState: AuthStateService
  ) {}

  ngOnInit(): void {
    this.loadContents();
    this.authState.isLoggedIn$.subscribe((v) => this.isAuthenticated = v);
  }

  loadContents(): void {
    this.isLoading = true;
    this.educationService.getAll().subscribe({
      next: (data) => {
        if (!data.length) {
          this.contenidos = [];
          this.isLoading = false;
          return;
        }
        // Cargar detalle completo de cada contenido para obtener archivos y secciones
        forkJoin(
          data.map(c => this.educationService.getById(c.id).pipe(catchError(() => of(c))))
        ).subscribe({
          next: (fullData) => {
            this.contenidos = fullData;
            this.isLoading = false;
            this.contenidos.forEach(c => this.refreshQuizFlag(c.id));
          },
          error: () => {
            this.contenidos = data;
            this.isLoading = false;
            this.contenidos.forEach(c => this.refreshQuizFlag(c.id));
          }
        });
      },
      error: (err) => {
        console.error('Error cargando contenidos:', err);
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar los contenidos del servidor.', 'error');
      }
    });
  }

  private refreshQuizFlag(contentId: number): void {
    this.quizService.existsForContent(contentId).subscribe({
      next: (r) => this.contentHasQuiz[contentId] = r.exists,
      error: () => this.contentHasQuiz[contentId] = false
    });
  }

  // ─────────── Form contenido (sin cambios funcionales) ───────────
  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
    else { this.isEditMode = false; this.editingId = null; this.wizardStep = 1; }
  }
  cancelEdit(): void { this.resetForm(); this.showForm = false; }

  // ── Wizard navigation ──
  goToStep(step: number): void { this.wizardStep = step; }

  nextStep(): void {
    if (this.wizardStep === 1) {
      if (!this.newTitle.trim()) { Swal.fire('Atención', 'El título es obligatorio.', 'warning'); return; }
      if (this.isEditMode && this.isLoadingEditData) {
        Swal.fire('Atención', 'Espera mientras se cargan los datos del contenido.', 'info'); return;
      }
    }
    this.wizardStep++;
  }
  prevStep(): void { if (this.wizardStep > 1) this.wizardStep--; }

  // ── Secciones ──
  addDraftSection(): void {
    this.draftSections.push({ title: '', description: '', files: [] });
  }
  removeDraftSection(idx: number): void { this.draftSections.splice(idx, 1); }

  onSectionFilesSelected(event: Event, idx: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.draftSections[idx].files = [...this.draftSections[idx].files, ...Array.from(input.files)];
      input.value = '';
    }
  }
  removeSectionFile(sIdx: number, fIdx: number): void {
    this.draftSections[sIdx].files.splice(fIdx, 1);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = [...this.selectedFiles, ...Array.from(input.files)];
      input.value = '';
    }
  }
  removeSelectedFile(index: number): void { this.selectedFiles.splice(index, 1); }

  onNewContentFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.newContentFiles = [...this.newContentFiles, ...Array.from(input.files)];
      input.value = '';
    }
  }
  removeNewContentFile(index: number): void { this.newContentFiles.splice(index, 1); }

  // ── Portada (create) ──
  onCoverImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      if (this.coverImagePreviewUrl) URL.revokeObjectURL(this.coverImagePreviewUrl);
      this.coverImageFile = input.files[0];
      this.coverImagePreviewUrl = URL.createObjectURL(input.files[0]);
      input.value = '';
    }
  }
  removeCoverImage(): void {
    if (this.coverImagePreviewUrl) URL.revokeObjectURL(this.coverImagePreviewUrl);
    this.coverImageFile = null;
    this.coverImagePreviewUrl = null;
  }

  // ── Galería (create) ──
  onGalleryFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(f => {
        this.galleryFiles.push(f);
        this.galleryPreviews.push(URL.createObjectURL(f));
      });
      input.value = '';
    }
  }
  removeGalleryFile(index: number): void {
    URL.revokeObjectURL(this.galleryPreviews[index]);
    this.galleryFiles.splice(index, 1);
    this.galleryPreviews.splice(index, 1);
  }

  // ── Portada (edit) ──
  onNewCoverImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      if (this.newCoverImagePreviewUrl) URL.revokeObjectURL(this.newCoverImagePreviewUrl);
      this.newCoverImageFile = input.files[0];
      this.newCoverImagePreviewUrl = URL.createObjectURL(input.files[0]);
      input.value = '';
    }
  }
  removeNewCoverImage(): void {
    if (this.newCoverImagePreviewUrl) URL.revokeObjectURL(this.newCoverImagePreviewUrl);
    this.newCoverImageFile = null;
    this.newCoverImagePreviewUrl = null;
  }

  // ── Galería (edit) ──
  onNewGalleryFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(f => {
        this.newGalleryFiles.push(f);
        this.newGalleryPreviews.push(URL.createObjectURL(f));
      });
      input.value = '';
    }
  }
  removeNewGalleryFile(index: number): void {
    URL.revokeObjectURL(this.newGalleryPreviews[index]);
    this.newGalleryFiles.splice(index, 1);
    this.newGalleryPreviews.splice(index, 1);
  }

  // ── Getters para edit mode: cover / galería / otros archivos ──
  get editCurrentCover(): EducationFile | null {
    return this.editContentCurrentFiles.find(f => f.fileType === 'IMAGE') ?? null;
  }
  get editCurrentGalleryImages(): EducationFile[] {
    return this.editContentCurrentFiles.filter(f => f.fileType === 'IMAGE').slice(1);
  }
  get editCurrentOtherFiles(): EducationFile[] {
    return this.editContentCurrentFiles.filter(f => f.fileType !== 'IMAGE');
  }

  onExistingSectionNewFilesSelected(event: Event, sIdx: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.existingSections[sIdx].newFiles = [...this.existingSections[sIdx].newFiles, ...Array.from(input.files)];
      input.value = '';
    }
  }
  removeExistingSectionNewFile(sIdx: number, fIdx: number): void {
    this.existingSections[sIdx].newFiles.splice(fIdx, 1);
  }

  toggleSectionDelete(sIdx: number): void {
    this.existingSections[sIdx].markedForDelete = !this.existingSections[sIdx].markedForDelete;
  }

  getFileName(url: string): string {
    return url.split('/').pop()?.split('?')[0] || url;
  }

  openEditForm(content: EducationContent): void {
    this.isEditMode = true;
    this.editingId = content.id;
    this.newTitle = content.title;
    this.newDescription = content.description || '';
    this.newCategory = content.category || 'reciclaje';
    this.selectedFiles = [];
    this.newContentFiles = [];
    this.draftSections = [];
    this.existingSections = [];
    this.editContentCurrentFiles = content.files || [];
    this.wizardStep = 1;

    // Quiz init
    this.quizForContentId = content.id;
    this.includeQuizInEdit = !!this.contentHasQuiz[content.id];
    this.isQuizEditMode = false;
    this.editingQuizId = null;
    this.quizTitle = '';
    this.quizDescription = '';
    this.quizPointsPerQuestion = 10;
    this.draftQuestions = [];

    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Cargar detalle completo (secciones + archivos actuales)
    this.isLoadingEditData = true;
    this.educationService.getById(content.id).subscribe({
      next: (full) => {
        this.editContentCurrentFiles = full.files || [];
        this.existingSections = (full.sections || [])
          .filter(s => s.id != null)
          .map(s => ({
            id: s.id!,
            title: s.title,
            description: s.description || '',
            existingFiles: s.files || [],
            newFiles: [],
            markedForDelete: false
          }));
        this.isLoadingEditData = false;
      },
      error: (err) => {
        console.error('Error cargando detalle del contenido:', err);
        this.isLoadingEditData = false;
      }
    });

    // Load quiz if exists
    if (this.contentHasQuiz[content.id]) {
      this.quizService.getAdminByContent(content.id).subscribe({
        next: (q: QuizAdmin) => {
          this.isQuizEditMode = true;
          this.editingQuizId = q.id;
          this.quizTitle = q.title;
          this.quizDescription = q.description || '';
          this.quizPointsPerQuestion = q.pointsPerQuestion;
          this.draftQuestions = q.questions.map(qq => ({
            text: qq.text,
            correctIndex: qq.correctIndex,
            options: [...qq.options]
          }));
        },
        error: () => {}
      });
    }
  }

  submitContent(): void {
    if (this.isEditMode) this.submitEdit(); else this.submitCreate();
  }

  private submitCreate(): void {
    if (!this.newTitle.trim()) { Swal.fire('Atención', 'El título es obligatorio.', 'warning'); return; }

    // Build combined files: portada first, then gallery, then other files
    const allSubmitFiles: File[] = [
      ...(this.coverImageFile ? [this.coverImageFile] : []),
      ...this.galleryFiles,
      ...this.selectedFiles
    ];
    if (allSubmitFiles.length === 0) { Swal.fire('Atención', 'Debes seleccionar al menos un archivo (portada, galería u otros).', 'warning'); return; }

    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.mp4', '.avi', '.mkv'];
    const allFiles = [
      ...allSubmitFiles,
      ...this.draftSections.flatMap(s => s.files)
    ];
    const invalidFile = allFiles.find(f => {
      const name = f.name.toLowerCase();
      return !allowedExtensions.some(ext => name.endsWith(ext));
    });
    if (invalidFile) { Swal.fire('Error', `El archivo "${invalidFile.name}" tiene una extensión no permitida.`, 'error'); return; }

    // Validar quiz si aplica
    if (this.includeQuizInCreate) {
      if (!this.quizTitle.trim()) { Swal.fire('Atención', 'El título del quiz es obligatorio.', 'warning'); return; }
      if (this.draftQuestions.length === 0) { Swal.fire('Atención', 'Agrega al menos una pregunta al quiz.', 'warning'); return; }
      for (let i = 0; i < this.draftQuestions.length; i++) {
        const q = this.draftQuestions[i];
        if (!q.text.trim()) { Swal.fire('Atención', `La pregunta #${i + 1} no tiene enunciado.`, 'warning'); return; }
        if (q.options.some(o => !o.trim())) { Swal.fire('Atención', `La pregunta #${i + 1} tiene opciones vacías.`, 'warning'); return; }
      }
    }

    this.isSubmitting = true;
    this.educationService.create(
      this.newTitle.trim(), this.newDescription.trim(), this.newCategory, allSubmitFiles
    ).subscribe({
      next: (saved) => {
        this.contenidos.unshift(saved);
        this.contentHasQuiz[saved.id] = false;
        this.postCreateSectionsAndQuiz(saved.id, saved.title);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error subiendo contenido:', err);
        Swal.fire('Error', 'No se pudo subir el contenido.', 'error');
      }
    });
  }

  private postCreateSectionsAndQuiz(contentId: number, contentTitle: string): void {
    const sectionsToCreate = this.draftSections.filter(s => s.title.trim());

    const createSections = (remaining: DraftSection[], done: () => void) => {
      if (remaining.length === 0) { done(); return; }
      const [sec, ...rest] = remaining;
      this.educationService.addSection(contentId, sec.title.trim(), sec.description.trim(), sec.files)
        .subscribe({ next: () => createSections(rest, done), error: () => createSections(rest, done) });
    };

    createSections(sectionsToCreate, () => {
      if (this.includeQuizInCreate) {
        const payload = {
          title: this.quizTitle.trim(),
          description: this.quizDescription.trim(),
          pointsPerQuestion: this.quizPointsPerQuestion,
          questions: this.draftQuestions.map(q => ({
            text: q.text.trim(), correctIndex: q.correctIndex, options: q.options.map(o => o.trim())
          }))
        };
        this.quizService.create(contentId, payload).subscribe({
          next: () => {
            this.contentHasQuiz[contentId] = true;
            this.isSubmitting = false;
            Swal.fire('¡Listo!', `Contenido "${contentTitle}" creado con secciones y quiz.`, 'success');
            this.resetForm(); this.showForm = false;
            this.loadContents();
          },
          error: () => {
            this.isSubmitting = false;
            Swal.fire('Parcial', `Contenido creado pero el quiz no se guardó. Puedes crearlo desde la tarjeta.`, 'warning');
            this.resetForm(); this.showForm = false;
            this.loadContents();
          }
        });
      } else {
        this.isSubmitting = false;
        const secCount = sectionsToCreate.length;
        Swal.fire('¡Listo!', `Contenido "${contentTitle}" creado${secCount ? ` con ${secCount} sección(es)` : ''}.`, 'success');
        this.resetForm(); this.showForm = false;
        this.loadContents();
      }
    });
  }

  private submitEdit(): void {
    if (!this.editingId) return;
    if (!this.newTitle.trim()) { Swal.fire('Atención', 'El título es obligatorio.', 'warning'); return; }

    if (this.includeQuizInEdit) {
      if (!this.quizTitle.trim()) { Swal.fire('Atención', 'El título del quiz es obligatorio.', 'warning'); return; }
      if (this.draftQuestions.length === 0) { Swal.fire('Atención', 'Agrega al menos una pregunta al quiz.', 'warning'); return; }
      for (let i = 0; i < this.draftQuestions.length; i++) {
        const q = this.draftQuestions[i];
        if (!q.text.trim()) { Swal.fire('Atención', `La pregunta #${i + 1} no tiene enunciado.`, 'warning'); return; }
        if (q.options.some(o => !o.trim())) { Swal.fire('Atención', `La pregunta #${i + 1} tiene opciones vacías.`, 'warning'); return; }
      }
    }

    const contentId = this.editingId;
    this.isSubmitting = true;

    // Nuevos archivos (portada + galería + otros) se envían directamente con el PUT
    const newFilesToUpload: File[] = [
      ...(this.newCoverImageFile ? [this.newCoverImageFile] : []),
      ...this.newGalleryFiles,
      ...this.newContentFiles
    ];

    this.educationService.update(contentId, {
      title: this.newTitle.trim(),
      description: this.newDescription.trim(),
      category: this.newCategory
    }, newFilesToUpload).subscribe({
      next: (updated) => {
        const idx = this.contenidos.findIndex(c => c.id === updated.id);
        if (idx !== -1) this.contenidos[idx] = { ...this.contenidos[idx], ...updated };
        this.processEditSections(contentId, () => {
          this.processEditQuiz(contentId, () => {
            this.isSubmitting = false;
            Swal.fire('¡Actualizado!', `Cambios guardados en "${updated.title}".`, 'success');
            this.resetForm(); this.showForm = false;
            this.loadContents();
          });
        });
      },
      error: () => {
        this.isSubmitting = false;
        Swal.fire('Error', 'No se pudieron guardar los cambios.', 'error');
      }
    });
  }

  private processEditSections(contentId: number, done: () => void): void {
    const ops: (() => any)[] = [];

    this.existingSections.filter(s => s.markedForDelete).forEach(s => {
      ops.push(() => this.educationService.deleteSection(contentId, s.id));
    });

    this.existingSections.filter(s => !s.markedForDelete).forEach(s => {
      // PUT /api/v1/education/sections/{sectionId} — si se envían files, reemplaza los anteriores
      ops.push(() => this.educationService.updateSection(s.id, s.title.trim(), s.description.trim(), s.newFiles));
    });

    this.draftSections.filter(s => s.title.trim()).forEach(s => {
      ops.push(() => this.educationService.addSection(contentId, s.title.trim(), s.description.trim(), s.files));
    });

    const run = (remaining: (() => any)[], cb: () => void) => {
      if (!remaining.length) { cb(); return; }
      const [first, ...rest] = remaining;
      first().subscribe({ next: () => run(rest, cb), error: () => run(rest, cb) });
    };
    run(ops, done);
  }

  private processEditNewContentFiles(contentId: number, done: () => void): void {
    const filesToAdd: File[] = [
      ...(this.newCoverImageFile ? [this.newCoverImageFile] : []),
      ...this.newGalleryFiles,
      ...this.newContentFiles
    ];
    if (!filesToAdd.length) { done(); return; }
    this.educationService.addFilesToContent(contentId, filesToAdd).subscribe({
      next: () => done(), error: () => done()
    });
  }

  private processEditQuiz(contentId: number, done: () => void): void {
    if (!this.includeQuizInEdit) { done(); return; }

    const payload = {
      title: this.quizTitle.trim(),
      description: this.quizDescription.trim(),
      pointsPerQuestion: this.quizPointsPerQuestion,
      questions: this.draftQuestions.map(q => ({
        text: q.text.trim(), correctIndex: q.correctIndex, options: q.options.map(o => o.trim())
      }))
    };

    const obs = (this.isQuizEditMode && this.editingQuizId)
      ? this.quizService.update(this.editingQuizId, payload)
      : this.quizService.create(contentId, payload);

    obs.subscribe({
      next: () => { this.contentHasQuiz[contentId] = true; done(); },
      error: () => done()
    });
  }

  deleteContent(content: EducationContent): void {
    Swal.fire({
      title: '¿Eliminar este contenido?',
      text: `Se eliminará "${content.title}" permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.educationService.delete(content.id).subscribe({
          next: () => {
            this.contenidos = this.contenidos.filter(c => c.id !== content.id);
            delete this.contentHasQuiz[content.id];
            Swal.fire('Eliminado', 'El contenido se eliminó correctamente.', 'success');
          },
          error: (err) => {
            console.error('Error eliminando:', err);
            Swal.fire('Error', 'No se pudo eliminar el contenido.', 'error');
          }
        });
      }
    });
  }

  private resetForm(): void {
    this.newTitle = ''; this.newDescription = ''; this.newCategory = 'reciclaje';
    this.selectedFiles = []; this.isEditMode = false; this.editingId = null; this.isSubmitting = false;
    this.wizardStep = 1; this.draftSections = []; this.includeQuizInCreate = false;
    this.quizTitle = ''; this.quizDescription = ''; this.quizPointsPerQuestion = 10; this.draftQuestions = [];
    this.existingSections = []; this.newContentFiles = []; this.editContentCurrentFiles = [];
    this.includeQuizInEdit = false; this.isQuizEditMode = false; this.editingQuizId = null;
    this.quizForContentId = null;
    // Portada y galería (create)
    if (this.coverImagePreviewUrl) URL.revokeObjectURL(this.coverImagePreviewUrl);
    this.coverImageFile = null; this.coverImagePreviewUrl = null;
    this.galleryPreviews.forEach(u => URL.revokeObjectURL(u));
    this.galleryFiles = []; this.galleryPreviews = [];
    // Portada y galería (edit)
    if (this.newCoverImagePreviewUrl) URL.revokeObjectURL(this.newCoverImagePreviewUrl);
    this.newCoverImageFile = null; this.newCoverImagePreviewUrl = null;
    this.newGalleryPreviews.forEach(u => URL.revokeObjectURL(u));
    this.newGalleryFiles = []; this.newGalleryPreviews = [];
    this.isLoadingEditData = false;
  }

  // ─────────── Helpers vista ───────────
  getPrimaryFileType(content: EducationContent): string {
    return content.files?.[0]?.fileType ?? 'OTRO';
  }
  getFileTypeIcon(fileType: string): string {
    switch (fileType) {
      case 'PDF': return 'book-open';
      case 'IMAGE': return 'image';
      case 'VIDEO': return 'video';
      default: return 'file-text';
    }
  }

  // ════════════ HU22: Lógica del Quiz ════════════

  /** Abrir form vacío para crear quiz */
  openCreateQuizForm(content: EducationContent): void {
    this.quizForContentId = content.id;
    this.isQuizEditMode = false;
    this.editingQuizId = null;
    this.quizTitle = `Quiz: ${content.title}`;
    this.quizDescription = '';
    this.quizPointsPerQuestion = 10;
    this.draftQuestions = [
      { text: '', correctIndex: 0, options: ['', ''] }
    ];
    this.showQuizForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Abrir form precargado para editar quiz */
  openEditQuizForm(content: EducationContent): void {
    this.quizService.getAdminByContent(content.id).subscribe({
      next: (q: QuizAdmin) => {
        this.quizForContentId = content.id;
        this.isQuizEditMode = true;
        this.editingQuizId = q.id;
        this.quizTitle = q.title;
        this.quizDescription = q.description || '';
        this.quizPointsPerQuestion = q.pointsPerQuestion;
        this.draftQuestions = q.questions.map(qq => ({
          text: qq.text,
          correctIndex: qq.correctIndex,
          options: [...qq.options]
        }));
        this.showQuizForm = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        console.error('Error cargando quiz:', err);
        Swal.fire('Error', 'No se pudo cargar el quiz.', 'error');
      }
    });
  }

  cancelQuizForm(): void {
    this.showQuizForm = false;
    this.draftQuestions = [];
    this.quizForContentId = null;
    this.isQuizEditMode = false;
    this.editingQuizId = null;
  }

  addDraftQuestion(): void {
    this.draftQuestions.push({ text: '', correctIndex: 0, options: ['', ''] });
  }

  removeDraftQuestion(idx: number): void {
    this.draftQuestions.splice(idx, 1);
  }

  addDraftOption(qIdx: number): void {
    if (this.draftQuestions[qIdx].options.length >= 6) return;
    this.draftQuestions[qIdx].options.push('');
  }

  removeDraftOption(qIdx: number, oIdx: number): void {
    const q = this.draftQuestions[qIdx];
    if (q.options.length <= 2) return;
    q.options.splice(oIdx, 1);
    if (q.correctIndex >= q.options.length) q.correctIndex = 0;
  }

  saveQuiz(): void {
    if (!this.quizForContentId) return;

    if (!this.quizTitle.trim()) {
      Swal.fire('Atención', 'El título del quiz es obligatorio.', 'warning'); return;
    }
    if (this.draftQuestions.length === 0) {
      Swal.fire('Atención', 'Agrega al menos una pregunta.', 'warning'); return;
    }
    for (let i = 0; i < this.draftQuestions.length; i++) {
      const q = this.draftQuestions[i];
      if (!q.text.trim()) {
        Swal.fire('Atención', `La pregunta #${i + 1} no tiene enunciado.`, 'warning'); return;
      }
      if (q.options.length < 2 || q.options.some(o => !o.trim())) {
        Swal.fire('Atención', `La pregunta #${i + 1} debe tener al menos 2 opciones (sin texto vacío).`, 'warning'); return;
      }
      if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
        Swal.fire('Atención', `Marca la respuesta correcta en la pregunta #${i + 1}.`, 'warning'); return;
      }
    }

    const payload: QuizRequestPayload = {
      title: this.quizTitle.trim(),
      description: this.quizDescription.trim(),
      pointsPerQuestion: this.quizPointsPerQuestion,
      questions: this.draftQuestions.map(q => ({
        text: q.text.trim(),
        correctIndex: q.correctIndex,
        options: q.options.map(o => o.trim())
      }))
    };

    this.isSubmittingQuiz = true;

    const obs = this.isQuizEditMode && this.editingQuizId
      ? this.quizService.update(this.editingQuizId, payload)
      : this.quizService.create(this.quizForContentId, payload);

    obs.subscribe({
      next: () => {
        this.isSubmittingQuiz = false;
        Swal.fire('¡Listo!', this.isQuizEditMode ? 'Quiz actualizado.' : 'Quiz creado correctamente.', 'success');
        if (this.quizForContentId) this.contentHasQuiz[this.quizForContentId] = true;
        this.cancelQuizForm();
      },
      error: (err) => {
        this.isSubmittingQuiz = false;
        console.error('Error guardando quiz:', err);
        const msg = err?.error?.message || 'No se pudo guardar el quiz.';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  deleteQuizFor(content: EducationContent): void {
  this.quizService.getAdminByContent(content.id).subscribe({
    next: (q) => {
      Swal.fire({
        title: '¿Eliminar quiz?',
        text: `Se eliminará el quiz de "${content.title}".`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(res => {
        if (res.isConfirmed) {
          this.quizService.delete(q.id).subscribe({
            next: () => {
              this.contentHasQuiz[content.id] = false;
              Swal.fire('Eliminado', 'Quiz eliminado correctamente.', 'success');
            },
            error: (err) => {
              console.error('Error eliminando quiz:', err);
              if (err?.status === 404) {
                // El quiz ya no existe — sincronizamos el estado y avisamos
                this.contentHasQuiz[content.id] = false;
                Swal.fire('Aviso', 'Este quiz ya no existe. La vista se actualizó.', 'info');
              } else {
                Swal.fire('Error', 'No se pudo eliminar el quiz.', 'error');
              }
            }
          });
        }
      });
    },
    error: (err) => {
      console.error('No se encontró el quiz:', err);
      this.contentHasQuiz[content.id] = false;
      Swal.fire('Aviso', 'Este contenido ya no tiene quiz. Se actualizó la vista.', 'info');
    }
  });
}

  hasQuizFor(contentId: number): boolean {
    return !!this.contentHasQuiz[contentId];
  }
}