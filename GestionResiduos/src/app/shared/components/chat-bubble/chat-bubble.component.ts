import { Component, Inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { RecyclingChatComponent } from '../recycling-chat/recycling-chat.component';
import { AuthStateService } from '../../../services/auth-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, RecyclingChatComponent],
  templateUrl: './chat-bubble.component.html',
  styleUrls: ['./chat-bubble.component.css']
})
export class ChatBubbleComponent implements OnInit, OnDestroy {
  isOpen = false;
  isLoggedIn = false;
  email = '';
  private subs = new Subscription();

  constructor(
    private authState: AuthStateService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.subs.add(this.authState.isLoggedIn$.subscribe(v => this.isLoggedIn = v));
    this.subs.add(this.authState.email$.subscribe(v => this.email = v));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
