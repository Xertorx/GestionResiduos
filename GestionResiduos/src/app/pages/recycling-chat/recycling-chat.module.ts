import { NgModule } from '@angular/core';
import { RecyclingChatComponent } from './recycling-chat.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [CommonModule, ReactiveFormsModule, RecyclingChatComponent],
  exports: [RecyclingChatComponent]
})
export class RecyclingChatModule {}
