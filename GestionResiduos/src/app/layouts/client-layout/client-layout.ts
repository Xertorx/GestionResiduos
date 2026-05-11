import { Component } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { RouterOutlet } from '@angular/router';
import { Spinner } from '../../shared/components/spinner/spinner';
import { ChatBubbleComponent } from '../../shared/components/chat-bubble/chat-bubble.component';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [Header, Footer, RouterOutlet, Spinner, ChatBubbleComponent],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.scss'
})
export class ClientLayout {

}
