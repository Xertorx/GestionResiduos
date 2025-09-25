import { Component, AfterViewInit } from '@angular/core';
import { IconService } from '../../services/icon.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements AfterViewInit {
  constructor(private iconService: IconService) {}

  ngAfterViewInit() {
   
  }
}