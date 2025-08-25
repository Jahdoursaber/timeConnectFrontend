import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuperviseurComponent } from './superviseur.component';
import { TechnicienComponent } from './technicien/technicien.component';
import { LeaveComponent } from './leave/leave.component';
import { DashboardSupComponent } from './dashboard-sup/dashboard-sup.component';

const routes: Routes = [
  {
    path: '',
    component: SuperviseurComponent,
    children: [

      {path:'techniciens', component: TechnicienComponent},
      {path:'leaves', component:LeaveComponent},
      {path:'dashboard', component:DashboardSupComponent}
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperviseurRoutingModule { }
