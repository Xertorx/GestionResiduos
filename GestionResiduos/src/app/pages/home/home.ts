import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  map!: mapboxgl.Map;
  

  accordions: boolean[] = [false, false, false]; // controla cada acordeón

  ngOnInit(): void {
    
  }
}
