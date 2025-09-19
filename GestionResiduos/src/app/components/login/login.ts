import { Component, EventEmitter,Input,Output } from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  onClose() {
    this.closed.emit(); //  Notifica al padre
  }

  email = '';
  password = '';

}
