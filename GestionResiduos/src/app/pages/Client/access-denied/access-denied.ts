import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-access-denied',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './access-denied.html',
  styleUrl: './access-denied.scss'
})
export class AccessDenied {}
