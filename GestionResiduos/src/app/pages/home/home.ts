import { Component, AfterViewInit } from '@angular/core';
import { IconService } from '../../services/icon.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements AfterViewInit {
  constructor(private iconService: IconService) {}

  ngAfterViewInit() {
   
  }
}