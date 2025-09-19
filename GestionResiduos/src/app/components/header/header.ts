import { Component, ElementRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Login } from '../login/login';


@Component({
  selector: 'app-header',
  imports: [RouterModule, Login],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  showLogin = false;

  openLogin() {
    this.showLogin = true;
  }

  closeLogin() {
    this.showLogin = false;
  }
  
  constructor(private el: ElementRef) { }
  ngAfterViewInit() {
    const mobileMenuBtn = this.el.nativeElement.querySelector('#mobile-menu-btn');
    const closeMenuBtn = this.el.nativeElement.querySelector('#close-menu-btn');
    const mobileMenu = this.el.nativeElement.querySelector('#mobile-menu');

    mobileMenuBtn?.addEventListener('click', () => {
      mobileMenu.classList.add('open');
    });

    closeMenuBtn?.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
    });
  }
}
