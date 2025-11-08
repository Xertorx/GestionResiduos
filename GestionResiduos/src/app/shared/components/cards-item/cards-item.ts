import { Component,Input,AfterViewInit  } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';


@Component({
  selector: 'app-cards-item',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './cards-item.html',
  styleUrls: ['./cards-item.scss']
})
export class CardsItem  implements AfterViewInit {
  @Input() icon: string = '';   // Clase del ícono (ej: "fa-solid fa-lightbulb")
  @Input() title: string = '';  // Título de la tarjeta
  @Input() description: string = '';   // Texto descriptivo
  
  ngAfterViewInit(): void {
    // Icons are rendered as Lucide components in the template; no runtime replace needed.
  }
}
