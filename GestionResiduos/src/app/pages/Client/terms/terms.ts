import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './terms.html',
})
export class Terms {
  lastUpdated = '11 de mayo de 2026';
}
