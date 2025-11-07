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
import { Register } from './pages/Client/register/register';

import { Profile } from './pages/Client/register/profile/profile';
import { Verify } from './pages/Client/register/verify/verify';

import { ClientLayout } from './layouts/client-layout/client-layout';
import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';
import { StartAdmin } from './pages/Admin/start-admin/start-admin';
import { EducationDetail } from './pages/Client/education/education-detail/education-detail';
import { DynamicQuiz } from './shared/components/dynamic-quiz/dynamic-quiz';

export const routes: Routes = [


 {
    path: '',
    component: ClientLayout,
    children: [
      { path: '', component: Home, pathMatch: 'full' },
      { path: 'login', component: Login },
      { path: 'calendar', component: Calendar },
      { path: 'about_us', component: About },
      { path: 'reports', component: Reports },
      { path: 'eco-points', component: EcoPoints },
      { path: 'calendar', component: Calendar },
      { path: 'education', component: Education },
      { path: 'education/:id', component: EducationDetail },
      { path: 'education/:id/quiz', component: DynamicQuiz },
      {
        path: 'register',
        component: Register,
        children: [
          { path: 'verify', component: Verify },
          { path: 'profile', component: Profile }
        ]
      },

      {
        path: 'foro',
        component: Foro,
        children: [
          { path: ':id', component: Detalles }
        ]
      },
    ],
  },

  {
    path: 'dashboard',
    component: DashboardLayout,
    children: [
     { path: '', component: StartAdmin }
    ],
  },

  // 🔹 Wildcard: siempre al final, fuera de los layouts
  { path: '**', redirectTo: '', pathMatch: 'full' },

   
];
