import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correct?: number | null;
};

@Component({
  selector: 'app-dynamic-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dynamic-quiz.html',
  styleUrls: ['./dynamic-quiz.scss']
})
export class DynamicQuiz {
  // Parent can pass questions in and observe changes via questionsChange
  @Input() questions: QuizQuestion[] = [
    { id: 1, question: '¿Cuál es el contenedor para materia orgánica?', options: ['Azul', 'Verde', 'Gris'], correct: 1 }
  ];

  @Output() questionsChange = new EventEmitter<QuizQuestion[]>();

  trackById(index: number, q: QuizQuestion) {
    return q.id;
  }

  addQuestion() {
    const nextId = (this.questions[this.questions.length - 1]?.id ?? 0) + 1;
    this.questions = [...this.questions, { id: nextId, question: 'Nueva pregunta', options: ['Opción 1'], correct: null }];
    this.emitChange();
  }

  removeQuestion(id: number) {
    this.questions = this.questions.filter(q => q.id !== id);
    this.emitChange();
  }

  addOption(q: QuizQuestion) {
    q.options.push('Nueva opción');
    this.emitChange();
  }

  removeOption(q: QuizQuestion, idx: number) {
    if (q.options.length <= 1) return;
    q.options.splice(idx, 1);
    this.emitChange();
  }

  emitChange() {
    this.questionsChange.emit(this.questions);
  }
}
