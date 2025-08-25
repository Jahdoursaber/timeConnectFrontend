import { Component, OnInit } from '@angular/core';
import { routes } from '../../../../shared/routes/routes';
import {
  breadCrumbItems,
  pageSelection,
} from '../../../../shared/models/models';
import {
  PaginationService,
  tablePageSize,
} from '../../../../shared/custom-pagination/pagination.service';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { VehicleModel } from '../../../../models/vehicleModel';
import { VehicleModelService } from '../../../../services/vehicleModel/vehicle-model.service';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastUtilService } from '../../../../services/toastUtil/toast-util.service';
declare var bootstrap: any;
@Component({
  selector: 'app-vehicle-model-archives',
  standalone: false,
  templateUrl: './vehicle-model-archives.component.html',
  styleUrl: './vehicle-model-archives.component.scss'
})
export class VehicleModelArchivesComponent {
  public routes = routes;
        initChecked = false;
        loading = false;
        private tablePageSizeSubscription?: Subscription;
        // pagination variables
        public pageSize = 10;
        public tableData: VehicleModel[] = [];
        public tableDataCopy: VehicleModel[] = [];
        public vehicles_models: VehicleModel[] = [];
        public actualData: VehicleModel[] = [];
        public currentPage = 1;
        public skip = 0;
        public limit: number = this.pageSize;
        public serialNumberArray: number[] = [];
        public totalData = 0;
        showFilter = false;
        public pageSelection: pageSelection[] = [];
        dataSource!: MatTableDataSource<VehicleModel>;
        public searchDataValue = '';
        breadCrumbItems: breadCrumbItems[] = [];
        selectedRestoreId?: number;
        constructor(
          private vehicleModelService: VehicleModelService,
          private router: Router,
          private pagination: PaginationService,
          private messageService: MessageService,
          private toast: ToastUtilService
        ) {
          this.breadCrumbItems = [
            { label: 'Archives' },
            { label: 'modèles', active: true },
          ];
        }

        ngOnInit(): void {
        this.fetchArchiveVehicleModels();
      }
      ngOnDestroy(): void {
        // Nettoyez la souscription pour éviter des fuites
        if (this.tablePageSizeSubscription) {
          this.tablePageSizeSubscription.unsubscribe();
        }
      }
      private fetchArchiveVehicleModels(): void {
          this.loading = true;
          this.vehicleModelService
            .getArchiveVehicleModels
            ()
            .subscribe((vehicles_models: VehicleModel[]) => {
              this.actualData = vehicles_models;
              this.totalData = vehicles_models.length;
              this.tableDataCopy = [...this.actualData];
              if (this.tablePageSizeSubscription) {
                this.tablePageSizeSubscription.unsubscribe();
              }
              this.tablePageSizeSubscription =
                this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
                  this.getTableData({ skip: res.skip, limit: res.limit });
                  this.pageSize = res.pageSize;
                });
              this.loading = false;
            });
        }
        private getTableData(pageOption: pageSelection): void {
          this.tableData = [];
          this.serialNumberArray = [];
          this.actualData.forEach((model: VehicleModel, index: number) => {
            const serialNumber = index + 1;
            if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
              (model as any).sNo = serialNumber;
              this.tableData.push(model);
            }
          });

          // Met à jour le dataSource sans le recréer
          if (!this.dataSource) {
            this.dataSource = new MatTableDataSource<VehicleModel>(this.tableData);
          } else {
            this.dataSource.data = this.tableData;
          }

          this.pagination.calculatePageSize.next({
            totalData: this.totalData,
            pageSize: this.pageSize,
            tableData: this.tableData,
            tableDataCopy: this.tableDataCopy,
            serialNumberArray: this.serialNumberArray,
          });
        }

        public searchData(value: string): void {
          if (value == '') {
            this.tableData = [...this.tableDataCopy];
          } else {
            this.dataSource.filter = value.trim().toLowerCase();
            this.tableData = this.dataSource.filteredData;
          }
        }

        public sortData(sort: Sort) {
          const data = this.tableData.slice();

          if (!sort.active || sort.direction === '') {
            this.tableData = data;
          } else {
            this.tableData = data.sort((a, b) => {
              const aValue = (a as never)[sort.active];

              const bValue = (b as never)[sort.active];
              return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
            });
          }
        }
        public changePageSize(pageSize: number): void {
          this.pageSelection = [];
          this.limit = pageSize;
          this.skip = 0;
          this.currentPage = 1;
          this.pagination.tablePageSize.next({
            skip: this.skip,
            limit: this.limit,
            pageSize: this.pageSize,
          });
        }

        trackById(index: number, item: VehicleModel): number {
            return item.id ?? index;
          }
        confirmRestore(id: number): void {
          this.selectedRestoreId = id;

          const modalEl = document.getElementById('restore_modal_vehicle_model');
          if (modalEl) {
            const modalInstance = new bootstrap.Modal(modalEl);
            modalInstance.show();
          }
        }
        restoreSelectedVehicleModel(): void {
          if (!this.selectedRestoreId) return;
          this.vehicleModelService.restoreVehicleModel(this.selectedRestoreId).subscribe({
            next: (res) => {
              this.tableData = this.tableData.filter(
                (user) => user.id !== this.selectedRestoreId
              );
              this.actualData = this.actualData.filter(
                (user) => user.id !== this.selectedRestoreId
              );

              // Recalcul numéros de série
              this.serialNumberArray = this.tableData.map((_, i) => i + 1);
              this.dataSource.data = [...this.tableData];
              this.totalData--;
              this.toast.showSuccess('Restoration effectuée avec succès ✅');
              this.selectedRestoreId = undefined;
            },
            error: (err) => {
              // Affiche une alerte ou un toast d’erreur
            },
          });
        }
}
