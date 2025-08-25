import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResponsableParcAutoRoutingModule } from './responsable-parc-auto-routing.module';
import { VehicleModelsComponent } from './vehicle-models/vehicle-models.component';
import { VehicleBrandsComponent } from './vehicle-brands/vehicle-brands.component';
import { VehicleTypesComponent } from './vehicle-types/vehicle-types.component';
import { VehicleArchivesComponent } from './archives/vehicle-archives/vehicle-archives.component';
import { VehicleTypeArchivesComponent } from './archives/vehicle-type-archives/vehicle-type-archives.component';
import { VehicleModelArchivesComponent } from './archives/vehicle-model-archives/vehicle-model-archives.component';
import { VehicleBrandArchivesComponent } from './archives/vehicle-brand-archives/vehicle-brand-archives.component';
import { VehicleAssignmentsComponent } from './archives/vehicle-assignments/vehicle-assignments.component';
import { ResponsableParcAutoComponent } from './responsable-parc-auto.component';
import { SharedModule } from '../../shared/shared-module';
import { ChipsModule } from 'primeng/chips';
import { MatChipsModule } from '@angular/material/chips';
import { materialModule } from '../../shared/material.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { CustomPaginationModule } from '../../shared/custom-pagination/custom-pagination.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTableModule } from '@angular/material/table';
import { MessageService } from 'primeng/api';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { DashboardRpaComponent } from './dashboard-rpa/dashboard-rpa.component';
@NgModule({
  declarations: [
    VehicleModelsComponent,
    VehicleBrandsComponent,
    VehicleTypesComponent,
    VehicleArchivesComponent,
    VehicleTypeArchivesComponent,
    VehicleModelArchivesComponent,
    VehicleBrandArchivesComponent,
    VehicleAssignmentsComponent,
    ResponsableParcAutoComponent,
    VehiclesComponent,
    DashboardRpaComponent
  ],
  imports: [
    CommonModule,
    ResponsableParcAutoRoutingModule,
    MatTableModule,
    CommonModule,
    ChipsModule,
    SharedModule,
    CustomPaginationModule,
    DragDropModule,
    MatChipsModule,
    materialModule,
    BsDropdownModule.forRoot(),
    TimepickerModule.forRoot()
  ],
  providers: [MessageService],
})
export class ResponsableParcAutoModule { }
