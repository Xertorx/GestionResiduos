import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

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
export class RecyclingChatComponent {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  chatForm: FormGroup;
  messages: ChatMessage[] = [];
  loading = false;
  error = '';
  typing = false;

  constructor(private fb: FormBuilder, private chat: ChatService) {
    this.chatForm = this.fb.group({
      message: ['']
    });
  }

  send() {
    if (this.chatForm.invalid || !this.chatForm.value.message.trim()) return;
    const userMsg = this.chatForm.value.message.trim();
    this.messages.push({ text: userMsg, sender: 'user' });
    this.chatForm.reset();
    this.loading = true;
    this.typing = true;
    this.error = '';
    this.scrollToBottom();
    this.chat.sendMessage(userMsg).subscribe({
      next: (reply) => {
        this.messages.push({ text: reply, sender: 'bot' });
        this.loading = false;
        this.typing = false;
        this.scrollToBottom();
      },
      error: () => {
        this.messages.push({ text: 'Error al conectar con la IA.', sender: 'bot' });
        this.loading = false;
        this.typing = false;
        this.scrollToBottom();
      }
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
