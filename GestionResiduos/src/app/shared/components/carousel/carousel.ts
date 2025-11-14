import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.html',
  styleUrls: ['./carousel.scss']
})
export class CarouselComponent implements OnInit {
  @Input() images: string[] = [];
  currentIndex = 0;

  ngOnInit(): void {
    if (this.images.length > 0) {
      this.startAutoplay();
    }
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prevSlide(): void {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
  }

  private startAutoplay(): void {
    setInterval(() => {
      this.nextSlide();
    }, 5000);
  }
}
