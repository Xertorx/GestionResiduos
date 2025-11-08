import { Component, AfterViewInit } from '@angular/core';
import { IconService } from '../../../services/icon.service';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-home',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements AfterViewInit {
  constructor(private iconService: IconService) {}

  ngAfterViewInit() {
   
  }
}