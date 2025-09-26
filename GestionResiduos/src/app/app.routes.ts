import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Register } from './pages/register/register';
import { Verify } from './pages/register/verify/verify';
import { Profile } from './pages/register/profile/profile';
import { Login } from './pages/login/login';
import { Calendar } from './pages/calendar/calendar';


export const routes: Routes = [
    {path: '',component:Home},
    {path: 'about_us',component:About},
    {path: 'register',component:Register},
    {path: 'register/verify',component:Verify},
    {path: 'login',component:Login},
    {path: 'register/profile',component:Profile},
    {path: 'calendar',component:Calendar},
    {path: '**',redirectTo:''}
];
