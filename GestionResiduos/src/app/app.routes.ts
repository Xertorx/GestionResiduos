import { Routes } from '@angular/router';



import { Foro } from './pages/Client/foro/foro';
import { Detalles } from './pages/Client/foro/detalles/detalles';
import { Home } from './pages/Client/home/home';
import { Calendar } from './pages/Client/calendar/calendar';
import { Login } from './pages/Client/login/login';
import { About } from './pages/Client/about/about';
import { Reports } from './pages/Client/reports/reports';
import { Education } from './pages/Client/education/education';
import { EcoPoints } from './pages/Client/eco-points/eco-points';
import { Dashboard } from './pages/Admin/dashboard/dashboard';
import { Register } from './pages/Client/register/register';

import { Profile } from './pages/Client/register/profile/profile';
import { Verify } from './pages/Client/register/verify/verify';


export const routes: Routes = [
    {path: '', component: Home, pathMatch: 'full'},
    
    // Redirecciones con slash final
    {path: 'calendar/', component: Calendar},
    //Paginas
    {path: 'register', component: Register,
        children: [
            {path: 'verify', component: Verify},
            {path: 'profile', component: Profile}
        ]
    },
    
  
    { path: 'foro', component: Foro,
        children: [
            { path: ':id', component: Detalles }
        ]
    },
    {path: 'login', component: Login},
    {path: 'calendar', component: Calendar},
    {path: 'about_us/', component: About},
    {path: 'reports', component: Reports},
    {path: 'education', component: Education},
    {path: 'eco-points', component: EcoPoints},
    {path: 'dashboard', component: Dashboard},
    {path: '**', redirectTo: ''}
];
