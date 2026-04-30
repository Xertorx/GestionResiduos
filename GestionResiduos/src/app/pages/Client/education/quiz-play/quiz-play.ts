import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import Swal from 'sweetalert2';
import {
  QuizService,
  QuizPlay as QuizPlayData,
  QuizResult,
  SubmitAnswer
} from '../../../../services/quiz.service';

@Component({
  selector: 'app-quiz-play',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './quiz-play.html',
  styleUrls: ['./quiz-play.scss']
})
export class QuizPlay implements OnInit {
  contentId!: number;
  quiz: QuizPlayData | null = null;
  isLoading = true;
  errorMsg = '';

  // Respuestas seleccionadas: questionId -> índice de opción
  selected: { [questionId: number]: number } = {};

  // Estado del envío
  submitting = false;
  result: QuizResult | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.contentId = idParam ? Number(idParam) : 0;

    if (!this.contentId) {
      this.errorMsg = 'Contenido inválido.';
      this.isLoading = false;
      return;
    }

    this.quizService.getPlayByContent(this.contentId).subscribe({
      next: (q) => {
        this.quiz = q;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando quiz:', err);
        this.errorMsg = 'Este contenido aún no tiene un quiz disponible.';
        this.isLoading = false;
      }
    });
  }

  selectOption(questionId: number, optionIndex: number): void {
    if (this.result) return; // bloquear cambios después de enviar
    this.selected[questionId] = optionIndex;
  }

  isSelected(questionId: number, optionIndex: number): boolean {
    return this.selected[questionId] === optionIndex;
  }

  /** Cuántas respondidas hasta ahora */
  get answeredCount(): number {
    return Object.keys(this.selected).length;
  }

  get totalQuestions(): number {
    return this.quiz?.questions.length ?? 0;
  }

  get progressPercent(): number {
    if (this.totalQuestions === 0) return 0;
    return Math.round((this.answeredCount / this.totalQuestions) * 100);
  }

  /** Verificar si una pregunta tuvo respuesta correcta (después de enviar) */
  wasCorrect(questionId: number): boolean | null {
    if (!this.result) return null;
    const r = this.result.perQuestion.find(p => p.questionId === questionId);
    return r ? r.wasCorrect : null;
  }

  /** Índice de la opción correcta para revelar después de enviar */
  correctIndexFor(questionId: number): number | null {
    if (!this.result) return null;
    const r = this.result.perQuestion.find(p => p.questionId === questionId);
    return r ? r.correctIndex : null;
  }

  submit(): void {
    if (!this.quiz) return;

    if (this.answeredCount < this.totalQuestions) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan preguntas',
        text: `Has respondido ${this.answeredCount} de ${this.totalQuestions}. ¿Enviar de todos modos?`,
        showCancelButton: true,
        confirmButtonText: 'Sí, enviar',
        cancelButtonText: 'Seguir respondiendo',
        confirmButtonColor: '#059669'
      }).then(res => {
        if (res.isConfirmed) this.doSubmit();
      });
      return;
    }
    this.doSubmit();
  }

  private doSubmit(): void {
    if (!this.quiz) return;
    this.submitting = true;

    const answers: SubmitAnswer[] = this.quiz.questions.map(q => ({
      questionId: q.id,
      selectedIndex: this.selected[q.id] ?? null
    }));

    this.quizService.submitAttempt(this.quiz.id, answers).subscribe({
      next: (res) => {
        this.submitting = false;
        this.result = res;

        if (res.firstAttempt) {
          Swal.fire({
            icon: 'success',
            title: `¡+${res.pointsEarned} puntos!`,
            html: `
              <p>Acertaste <b>${res.correctAnswers}/${res.totalQuestions}</b>.</p>
              <p>Tu total ahora: <b>${res.userTotalPoints}</b> puntos.</p>
            `,
            confirmButtonColor: '#059669',
            confirmButtonText: '¡Genial!'
          });
        } else {
          Swal.fire({
            icon: 'info',
            title: `Acertaste ${res.correctAnswers}/${res.totalQuestions}`,
            text: 'Solo el primer intento otorga puntos. ¡Sigue aprendiendo!',
            confirmButtonColor: '#059669'
          });
        }

        // scroll suave al resumen
        setTimeout(() => {
          const el = document.getElementById('quiz-result-summary');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error enviando intento:', err);
        const msg = err?.error?.message || 'No se pudo enviar tu intento.';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  retry(): void {
    this.selected = {};
    this.result = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    this.router.navigate(['/education', this.contentId]);
  }
}