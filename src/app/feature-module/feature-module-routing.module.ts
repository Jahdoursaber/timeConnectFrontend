import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeatureModuleComponent } from './feature-module.component';
import { Login2Component } from '../auth/login-2/login-2.component';
import { ForgotPassword2Component } from '../auth/forgot-password-2/forgot-password-2.component';
import { ResetPassword2Component } from '../auth/reset-password-2/reset-password-2.component';

import { PasswordStrengthComponent } from '../auth/password-strength/password-strength.component';
import { Success2Component } from '../auth/success-2/success-2.component';

import { Error404Component } from '../auth/error-404/error-404.component';
import { Error500Component } from '../auth/error-500/error-500.component';

import { RoleGuard } from '../guards/role.guard';
import { CalendarComponent } from './calendar/calendar.component';
import { TechnicienHistoryComponent } from './technicien-history/technicien-history.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { DashboardRHComponent } from './rh/dashboard-rh/dashboard-rh.component';

const routes: Routes = [
  {
    path: '',
    component: FeatureModuleComponent,
    children: [
      // {
      //   path: 'login-2',
      //   component: Login2Component,
      // },

      {
        path: 'forgot-password-2',
        component: ForgotPassword2Component,
      },

      {
        path: 'password-strength',
        component: PasswordStrengthComponent,
      },

      {
        path: 'reset-password-2',
        component: ResetPassword2Component,
      },

      {
        path: 'success-2',
        component: Success2Component,
      },
      {
        path: 'error-404',
        component: Error404Component,
      },
      {
        path: 'error-500',
        component: Error500Component,
      },
      {
        path: 'dashboard/index',
        component: DashboardRHComponent,

      },
      { path: 'rh', loadChildren:() => import('./rh/rh.module').then(m => m.RhModule) },
      { path: 'superviseur',loadChildren:()=> import('./superviseur/superviseur.module').then( m => m.SuperviseurModule)},
      { path: 'leaves', component:CalendarComponent},
      { path: 'leaves/calendar', component: CalendarComponent},
      { path: 'technicians/history', component: TechnicienHistoryComponent},
      { path: 'user-profile', component:UserProfileComponent},
      { path: 'vehicle-manager', loadChildren:() => import('./responsable-parc-auto/responsable-parc-auto.module').then(m => m.ResponsableParcAutoModule), canActivate: [RoleGuard],data: {  roles:['responsablePV'] } },
      ],
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeatureModuleRoutingModule {}
