import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuperviseurRoutingModule } from './superviseur-routing.module';
import { MatTableModule } from '@angular/material/table';
import { ChipsModule } from 'primeng/chips';
import { SharedModule } from '../../shared/shared-module';
import { CustomPaginationModule } from '../../shared/custom-pagination/custom-pagination.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatChipsModule } from '@angular/material/chips';
import { materialModule } from '../../shared/material.module';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { MessageService } from 'primeng/api';
import { SuperviseurComponent } from './superviseur.component';
import { TechnicienComponent } from './technicien/technicien.component';
import { LeaveComponent } from './leave/leave.component';
import { DashboardSupComponent } from './dashboard-sup/dashboard-sup.component';
@NgModule({
  declarations: [
    SuperviseurComponent,
    TechnicienComponent,
    LeaveComponent,
    DashboardSupComponent
  ],
  imports: [
    CommonModule,
    SuperviseurRoutingModule,
    MatTableModule,
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
export class SuperviseurModule { }
