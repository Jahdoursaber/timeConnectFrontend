import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RhComponent } from './rh.component';
import { ActivityComponent } from './activity/activity.component';
import { JobComponent } from './job/job.component';
import { CompanyComponent } from './company/company.component';
import { CollectiveAgreementsComponent } from './collective-agreements/collective-agreements.component';
import { ApeComponent } from './ape/ape.component';
import { UserComponent } from './user/user.component';
import { Role } from '../../shared/data/role';
import { AdvanceRequestComponent } from './advance-request/advance-request.component';
import { OtherRequestComponent } from './other-request/other-request.component';
import { RoleGuard } from '../../guards/role.guard';
import { LeaveComponent } from './leave/leave.component';
import { LeaveHistoryComponent } from './leave-history/leave-history.component';
import { ArchiveUserComponent } from './archive-user/archive-user.component';
import { DashboardRHComponent } from './dashboard-rh/dashboard-rh.component';

const routes: Routes = [
  {
    path: '',
    component: RhComponent,
    children: [
      { path: 'activity', component: ActivityComponent },
      { path: 'jobss', component: JobComponent},
      { path: 'companies', component: CompanyComponent },
      { path: 'collectives-agreements', component: CollectiveAgreementsComponent },
      { path: 'apes', component: ApeComponent },
      { path: 'techniciens', component: UserComponent, canActivate: [RoleGuard],data: { role: Role.Techniciens, roles:['RH'] } },
      { path: 'rhs', component: UserComponent, data: { role: Role.RH, roles:['RH'] } },
      { path: 'superviseurs', component: UserComponent, data: { role: Role.Superviseur, roles:['RH','superviseur'] } },
      { path: 'responsables-parc-auto', component: UserComponent, data: { role: Role.RespParc, roles:['RH','superviseur'] } },
      { path: 'advance-request', component: AdvanceRequestComponent},
      { path: 'other-request', component:OtherRequestComponent},
      { path: 'leaves', component:LeaveComponent},
      { path: 'leave-history/:id', component:LeaveHistoryComponent},
      { path: 'archive-user', component:ArchiveUserComponent},
      { path: 'dashboard', component:DashboardRHComponent}
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RhRoutingModule { }
