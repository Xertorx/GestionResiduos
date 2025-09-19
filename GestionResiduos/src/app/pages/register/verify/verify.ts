import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-verify',
  imports: [],
  templateUrl: './verify.html',
  styleUrl: './verify.scss'
})
export class Verify implements OnInit, OnDestroy{
  countdown: string = '05:00'; // Valor inicial
  private interval: any;
  private totalSeconds: number = 5 * 60; // 5 minutos

  ngOnInit() {
    this.startCountdown();
  }

  ngOnDestroy() {
    clearInterval(this.interval); // Limpiar intervalo al salir del componente
  }

  startCountdown() {
    this.updateCountdown(); // Actualiza el primer valor
    this.interval = setInterval(() => {
      if (this.totalSeconds > 0) {
        this.totalSeconds--;
        this.updateCountdown();
      } else {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  updateCountdown() {
    const minutes = Math.floor(this.totalSeconds / 60);
    const seconds = this.totalSeconds % 60;
    this.countdown = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
