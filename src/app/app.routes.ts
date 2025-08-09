import {Routes} from '@angular/router';
import {LandingPage} from './pages/landing-page/landing-page';
import {LoginPage} from './pages/login-page/login-page';
import {DashboardPage} from './pages/dashboard-page/dashboard-page';
import {AuthGuard} from './Utils/auth-guard';
import {LoginGuard} from './Utils/login-guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
    canActivate: [LoginGuard]
  },
  {
    path: 'login',
    component: LoginPage,
    canActivate: [LoginGuard]
  },
  {
    path: 'dashboard',
    component: DashboardPage,
    canActivate: [AuthGuard]
  }
];
