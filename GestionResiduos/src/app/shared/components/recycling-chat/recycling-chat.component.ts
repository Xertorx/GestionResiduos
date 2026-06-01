import { Component, ViewChild, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
}

@Component({
  selector: 'recycling-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recycling-chat.component.html',
  styleUrls: ['./recycling-chat.component.css']
})
export class RecyclingChatComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @Input() userId: string = '';
  chatForm: FormGroup;
  messages: ChatMessage[] = [];
  loading = false;
  error = '';
  typing = false;
  private storageKey = '';

  constructor(private fb: FormBuilder, private chat: ChatService) {
    this.chatForm = this.fb.group({
      message: ['']
    });
  }

  ngOnInit() {
    this.storageKey = this.userId ? `ecobolivar-chat-history-${this.userId}` : '';
    if (this.storageKey) {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.messages = JSON.parse(saved);
      } else {
        this.addWelcome();
      }
    } else {
      this.addWelcome();
    }
  }

  ngOnDestroy() {
    this.saveHistory();
  }

  private addWelcome() {
    this.messages = [{
      text: '👋 <b>Bienvenido, soy <span style="color:#059669">EcoBolívar Chat</span></b>.<br>Estoy para ayudarte en cualquier duda que tengas sobre reciclaje y gestión de residuos.',
      sender: 'bot'
    }];
  }

  send() {
    if (this.chatForm.invalid || !this.chatForm.value.message.trim()) return;
    const userMsg = this.chatForm.value.message.trim();
    this.messages.push({ text: userMsg, sender: 'user' });
    this.saveHistory();
    this.chatForm.reset();
    this.loading = true;
    this.typing = true;
    this.error = '';
    this.scrollToBottom();
    this.chat.sendMessage(userMsg).subscribe({
      next: (reply) => {
        // Formatear saltos de línea y espacios
        const formatted = reply.replace(/\n/g, '<br>').replace(/  +/g, (match: string) => '&nbsp;'.repeat(match.length));
        this.messages.push({ text: formatted, sender: 'bot' });
        this.saveHistory();
        this.loading = false;
        this.typing = false;
        this.scrollToBottom();
      },
      error: () => {
        this.messages.push({ text: 'Error al conectar con la IA.', sender: 'bot' });
        this.saveHistory();
        this.loading = false;
        this.typing = false;
        this.scrollToBottom();
      }
    });
  }

  private saveHistory() {
    if (this.storageKey) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
