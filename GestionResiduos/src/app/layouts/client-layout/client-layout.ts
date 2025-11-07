import { Component } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [Header,Footer,RouterOutlet],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.scss'
})
export class ClientLayout {

}
