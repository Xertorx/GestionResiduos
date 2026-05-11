import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './privacy.html',
})
export class Privacy {
  lastUpdated = '11 de mayo de 2026';
}
