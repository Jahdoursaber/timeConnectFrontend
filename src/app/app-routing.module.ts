import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Login2Component } from './auth/login-2/login-2.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';

export const routes: Routes = [
  {
          path: 'login-2',
          component: Login2Component,
          canActivate: [LoginGuard]
        },

        {
          path: '',
          canActivate: [AuthGuard],
          loadChildren: () =>
            import('./feature-module/feature-module.module').then(
              m => m.FeatureModuleModule
            ),
        },



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
