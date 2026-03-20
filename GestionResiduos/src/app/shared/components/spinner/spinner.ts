import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './spinner.html'
})
export class Spinner {
  constructor(public loadingService: LoadingService) {}
}