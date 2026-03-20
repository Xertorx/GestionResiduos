import { Component } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { RouterOutlet } from '@angular/router';
import { Spinner } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [Header,Footer,RouterOutlet,Spinner],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.scss'
})
export class ClientLayout {

}
