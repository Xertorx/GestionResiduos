import { AfterViewInit, Component, ElementRef, Input, NgZone, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.html',
  styleUrls: ['./carousel.scss']
})
export class CarouselComponent implements AfterViewInit {
  @Input() images: string[] = [];
  @ViewChild('swiperContainer', { static: false }) swiperContainer!: ElementRef;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // Esperar a que Angular termine de renderizar completamente el DOM
    setTimeout(() => {
      this.initSwiper();
    }, 300); // pequeño retardo para evitar inicializar antes de tiempo
  }

  private async initSwiper() {
    if (!this.swiperContainer?.nativeElement || this.images.length === 0) return;

    // Import dinámico (evita errores de SSR o falta de typings)
    const { default: Swiper } = await import('swiper');
    const { Navigation, Pagination, Autoplay } = await import('swiper/modules');

    // Inicializar Swiper fuera de la zona de Angular (mejor rendimiento)
    this.ngZone.runOutsideAngular(() => {
      new Swiper(this.swiperContainer.nativeElement, {
        modules: [Navigation, Pagination, Autoplay],
        slidesPerView: 1,
        spaceBetween: 10,
        loop: true,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        }
      });
    });
  }
}
