import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResponsableParcAutoComponent } from './responsable-parc-auto.component';
import { VehicleBrandsComponent } from './vehicle-brands/vehicle-brands.component';
import { VehicleModelsComponent } from './vehicle-models/vehicle-models.component';
import { VehicleTypesComponent } from './vehicle-types/vehicle-types.component';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { VehicleBrandArchivesComponent } from './archives/vehicle-brand-archives/vehicle-brand-archives.component';
import { VehicleModelArchivesComponent } from './archives/vehicle-model-archives/vehicle-model-archives.component';
import { VehicleTypeArchivesComponent } from './archives/vehicle-type-archives/vehicle-type-archives.component';
import { VehicleArchivesComponent } from './archives/vehicle-archives/vehicle-archives.component';
import { DashboardRpaComponent } from './dashboard-rpa/dashboard-rpa.component';
import { VehicleAssignmentsComponent } from './archives/vehicle-assignments/vehicle-assignments.component';

const routes: Routes = [
  {
    path: '',
    component: ResponsableParcAutoComponent ,
    children: [
      { path: 'vehicle-brands', component: VehicleBrandsComponent },
      { path: 'vehicle-models', component: VehicleModelsComponent },
      { path: 'vehicle-types',  component: VehicleTypesComponent  },
      { path: 'vehicles',       component: VehiclesComponent},
      { path: 'archives/vehicle-brands', component: VehicleBrandArchivesComponent },
      { path: 'archives/vehicle-models', component: VehicleModelArchivesComponent },
      { path: 'archives/vehicle-types',  component: VehicleTypeArchivesComponent  },
      { path: 'archives/vehicles',       component: VehicleArchivesComponent},
      { path: 'dashboard', component: DashboardRpaComponent},
      { path: 'vehicle-assigments', component: VehicleAssignmentsComponent}
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResponsableParcAutoRoutingModule { }
