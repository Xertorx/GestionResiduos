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
import { Faq } from './pages/Client/faq/faq';
import { Contact } from './pages/Client/contact/contact';
import { Privacy } from './pages/Client/privacy/privacy';
import { Terms } from './pages/Client/terms/terms';

import { Profile } from './pages/Client/register/profile/profile';
import { Verify } from './pages/Client/register/verify/verify';
import { AccessDenied } from './pages/Client/access-denied/access-denied';
import { verifyGuard } from './pages/Client/register/register-verify.guard';
import { adminGuard } from './guards/admin.guard';
import { UserProfileEdit } from './pages/Client/user-profile-edit/user-profile-edit';
import { UserProfile } from './pages/Client/profile/profile';

import { ClientLayout } from './layouts/client-layout/client-layout';
import { DashboardLayout } from './layouts/dashboard-layout/dashboard-layout';
import { StartAdmin } from './pages/Admin/start-admin/start-admin';
import { UsuariosAdmin } from './pages/Admin/usuarios/usuarios';
import { EcoPuntosAdmin } from './pages/Admin/eco-puntos/eco-puntos';
import { CalendarioRecoleccionAdmin } from './pages/Admin/calendario-recoleccion/calendario-recoleccion';
import { ReportesAdmin } from './pages/Admin/reportes/reportes';
import { EducacionAdmin } from './pages/Admin/educacion/educacion';
import { SeguimientoAdmin } from './pages/Admin/seguimiento/seguimiento';
import { ForoAdmin } from './pages/Admin/foro/foro';
import { CategoriasAdmin } from './pages/Admin/categorias/categorias';
import { EducationDetail } from './pages/Client/education/education-detail/education-detail';
import { QuizPlay } from './pages/Client/education/quiz-play/quiz-play';
import { ResetPassword } from './pages/Client/reset-password/reset-password';
import { EmailPreviewComponent } from './pages/email-preview/email-preview';
import { Ranking } from './pages/Client/ranking/ranking';


// ReportStats will be lazy-loaded

export const routes: Routes = [


 {
    path: '',
    component: ClientLayout,
    children: [
      { path: '', component: Home, pathMatch: 'full' },
      { path: 'login', component: Login },
      { path: 'reset-password', component: ResetPassword },
      { path: 'calendar', component: Calendar },
      { path: 'about_us', component: About },
      { path: 'reports', component: Reports },
      { path: 'eco-points', component: EcoPoints },
      { path: 'calendar', component: Calendar },
      { path: 'education', component: Education },
      { path: 'education/:id', component: EducationDetail },
      { path: 'education/:id/quiz', component: QuizPlay },
      { path: 'register', component: Register },
      { path: 'register/verify', component: Verify, canActivate: [verifyGuard] },
      { path: 'register/verify/:token', component: Verify },
      { path: 'register/profile', component: Profile },
      { path: 'profile', component: UserProfile },
      { path: 'profile/edit', component: UserProfileEdit },
      { path: 'access-denied', component: AccessDenied },
      { path: 'email-preview', component: EmailPreviewComponent },
      { path: 'ranking', component: Ranking },
      { path: 'faq', component: Faq },
      { path: 'contact', component: Contact },
      { path: 'privacy', component: Privacy },
      { path: 'terms', component: Terms },

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
    component: DashboardLayout, canActivate: [adminGuard],
    children: [
     { path: '', component: StartAdmin }
     ,{ path: 'usuarios', component: UsuariosAdmin }
     ,{ path: 'eco-puntos', component: EcoPuntosAdmin }
     ,{ path: 'calendario-recoleccion', component: CalendarioRecoleccionAdmin }
     ,{ path: 'reportes', component: ReportesAdmin }
     ,{ path: 'reportes/categorias', component: CategoriasAdmin }
     ,{ path: 'educacion', component: EducacionAdmin }
     ,{ path: 'seguimiento', component: SeguimientoAdmin }
     ,{ path: 'foro', component: ForoAdmin }
    ,{ path: 'report-stats', loadComponent: () => import('./admin/report-stats/report-stats.component').then(m => m.ReportStatsComponent), canActivate: [adminGuard] },
    ],
  },

  // 🔹 Wildcard: siempre al final, fuera de los layouts
  { path: '**', redirectTo: '', pathMatch: 'full' },

   
];
