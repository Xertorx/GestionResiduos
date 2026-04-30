import { Component, OnInit } from '@angular/core';
import { AuthStateService } from '../../../services/auth-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { EducationService, EducationContent } from '../../../services/education.service';
import {
  QuizService,
  QuizAdmin,
  QuizRequestPayload
} from '../../../services/quiz.service';
import Swal from 'sweetalert2';

interface DraftQuestion {
  text: string;
  correctIndex: number;
  options: string[];
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

  newTitle = '';
  newDescription = '';
  newCategory = 'reciclaje';
  selectedFiles: File[] = [];

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
        this.contenidos = data;
        this.isLoading = false;
        // Verificar quiz por cada contenido
        this.contenidos.forEach(c => this.refreshQuizFlag(c.id));
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
    else { this.isEditMode = false; this.editingId = null; }
  }
  cancelEdit(): void { this.resetForm(); this.showForm = false; }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles = [...this.selectedFiles, ...Array.from(input.files)];
      input.value = '';
    }
  }
  removeSelectedFile(index: number): void { this.selectedFiles.splice(index, 1); }

  openEditForm(content: EducationContent): void {
    this.isEditMode = true;
    this.editingId = content.id;
    this.newTitle = content.title;
    this.newDescription = content.description || '';
    this.newCategory = content.category || 'reciclaje';
    this.selectedFiles = [];
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  submitContent(): void {
    if (this.isEditMode) this.submitEdit(); else this.submitCreate();
  }

  private submitCreate(): void {
    if (!this.newTitle.trim()) { Swal.fire('Atención', 'El título es obligatorio.', 'warning'); return; }
    if (this.selectedFiles.length === 0) { Swal.fire('Atención', 'Debes seleccionar al menos un archivo.', 'warning'); return; }

    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.mp4', '.avi', '.mkv'];
    const invalidFile = this.selectedFiles.find(f => {
      const name = f.name.toLowerCase();
      return !allowedExtensions.some(ext => name.endsWith(ext));
    });
    if (invalidFile) { Swal.fire('Error', `El archivo "${invalidFile.name}" tiene una extensión no permitida.`, 'error'); return; }

    this.isSubmitting = true;
    this.educationService.create(
      this.newTitle.trim(), this.newDescription.trim(), this.newCategory, this.selectedFiles
    ).subscribe({
      next: (saved) => {
        this.isSubmitting = false;
        Swal.fire('¡Listo!', `Contenido "${saved.title}" creado con ${saved.files?.length ?? 0} archivo(s).`, 'success');
        this.contenidos.unshift(saved);
        this.contentHasQuiz[saved.id] = false;
        this.resetForm(); this.showForm = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error subiendo contenido:', err);
        Swal.fire('Error', 'No se pudo subir el contenido.', 'error');
      }
    });
  }

  private submitEdit(): void {
    if (!this.editingId) return;
    if (!this.newTitle.trim()) { Swal.fire('Atención', 'El título es obligatorio.', 'warning'); return; }

    this.isSubmitting = true;
    this.educationService.update(this.editingId, {
      title: this.newTitle.trim(),
      description: this.newDescription.trim(),
      category: this.newCategory
    }).subscribe({
      next: (updated) => {
        this.isSubmitting = false;
        Swal.fire('¡Actualizado!', `Cambios guardados en "${updated.title}".`, 'success');
        const idx = this.contenidos.findIndex(c => c.id === updated.id);
        if (idx !== -1) this.contenidos[idx] = updated;
        this.resetForm(); this.showForm = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error actualizando:', err);
        Swal.fire('Error', 'No se pudieron guardar los cambios.', 'error');
      }
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