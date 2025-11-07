import { AfterViewInit, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconService } from '../../../services/icon.service';
import { LucideAngularModule } from 'lucide-angular';


@Component({
  selector: 'app-login',
    imports: [RouterLink, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements AfterViewInit {
  constructor(private iconService: IconService) { }

  ngAfterViewInit() {
   
  }

}
