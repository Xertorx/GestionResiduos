import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './contact.html',
})
export class Contact {
  form = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  subjects = [
    'Problema técnico',
    'Reporte de eco-punto',
    'Sugerencia de mejora',
    'Duda sobre reciclaje',
    'Solicitud de información',
    'Otro',
  ];

  sent = false;
  sending = false;

  submit(): void {
    if (!this.form.name || !this.form.email || !this.form.message) return;
    this.sending = true;
    // Simulate network delay
    setTimeout(() => {
      this.sending = false;
      this.sent = true;
      this.form = { name: '', email: '', subject: '', message: '' };
    }, 1200);
  }
}
