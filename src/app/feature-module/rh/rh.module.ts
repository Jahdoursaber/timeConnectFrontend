import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RhRoutingModule } from './rh-routing.module';
import { RhComponent } from './rh.component';
import { SharedModule } from '../../shared/shared-module';
import { ChipsModule } from 'primeng/chips';
import { MatChipsModule } from '@angular/material/chips';
import { materialModule } from '../../shared/material.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { CustomPaginationModule } from '../../shared/custom-pagination/custom-pagination.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ActivityComponent } from './activity/activity.component';
import { MatTableModule } from '@angular/material/table';
import { CompanyComponent } from './company/company.component';
import { JobComponent } from './job/job.component';
import { ApeComponent } from './ape/ape.component';
import { CollectiveAgreementsComponent } from './collective-agreements/collective-agreements.component';
import { UserComponent } from './user/user.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { AdvanceRequestComponent } from './advance-request/advance-request.component';
import { OtherRequestComponent } from './other-request/other-request.component';
import { LeaveComponent } from './leave/leave.component';
import { MessageService } from 'primeng/api';
import { LeaveHistoryComponent } from './leave-history/leave-history.component';
import { ArchiveUserComponent } from './archive-user/archive-user.component';
import { DashboardRHComponent } from './dashboard-rh/dashboard-rh.component';
@NgModule({
  declarations: [
    RhComponent,
    ActivityComponent,
    CompanyComponent,
    JobComponent,
    ApeComponent,
    CollectiveAgreementsComponent,
    UserComponent,
    AdvanceRequestComponent,
    OtherRequestComponent,
    LeaveComponent,
    AdvanceRequestComponent,
    LeaveHistoryComponent,
    ArchiveUserComponent,
    DashboardRHComponent,
  ],
  imports: [
    MatTableModule,
    CommonModule,
    RhRoutingModule,
    ChipsModule,
    SharedModule,
    CustomPaginationModule,
    DragDropModule,
    MatChipsModule,
    materialModule,
    NgxIntlTelInputModule,
    BsDropdownModule.forRoot(),
    TimepickerModule.forRoot()
  ],
  providers: [MessageService],
})
export class RhModule { }
