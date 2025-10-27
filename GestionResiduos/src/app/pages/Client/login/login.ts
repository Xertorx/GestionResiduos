import { AfterViewInit, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconService } from '../../../services/icon.service';


@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements AfterViewInit {
  constructor(private iconService: IconService) { }

  ngAfterViewInit() {
   
  }

}
