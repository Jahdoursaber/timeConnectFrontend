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
import { VehicleType } from '../../../../models/vehicleType';
import { VehicleTypeService } from '../../../../services/vehicleType/vehicle-type.service';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastUtilService } from '../../../../services/toastUtil/toast-util.service';
declare var bootstrap: any;

@Component({
  selector: 'app-vehicle-type-archives',
  standalone: false,
  templateUrl: './vehicle-type-archives.component.html',
  styleUrl: './vehicle-type-archives.component.scss'
})
export class VehicleTypeArchivesComponent implements OnInit{
   public routes = routes;
    initChecked = false;
    loading = false;
    private tablePageSizeSubscription?: Subscription;
    // pagination variables
    public pageSize = 10;
    public tableData: VehicleType[] = [];
    public tableDataCopy: VehicleType[] = [];
    public vehicles_types: VehicleType[] = [];
    public actualData: VehicleType[] = [];
    public currentPage = 1;
    public skip = 0;
    public limit: number = this.pageSize;
    public serialNumberArray: number[] = [];
    public totalData = 0;
    showFilter = false;
    public pageSelection: pageSelection[] = [];
    dataSource!: MatTableDataSource<VehicleType>;
    public searchDataValue = '';
    breadCrumbItems: breadCrumbItems[] = [];
    selectedRestoreId?: number;
    constructor(
      private vehicleTypeService: VehicleTypeService,
      private router: Router,
      private pagination: PaginationService,
      private messageService: MessageService,
      private toast: ToastUtilService
    ) {
      this.breadCrumbItems = [
        { label: 'Archives' },
        { label: 'Type de Véhicules', active: true },
      ];
    }

    ngOnInit(): void {
    this.fetchArchiveVehicleTypes();
  }
  ngOnDestroy(): void {
    // Nettoyez la souscription pour éviter des fuites
    if (this.tablePageSizeSubscription) {
      this.tablePageSizeSubscription.unsubscribe();
    }
  }
  private fetchArchiveVehicleTypes(): void {
      this.loading = true;
      this.vehicleTypeService
        .getArchiveVehicleTypes
        ()
        .subscribe((vehicles_types: VehicleType[]) => {
          this.actualData = vehicles_types;
          this.totalData = vehicles_types.length;
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
      this.actualData.forEach((vehicle: VehicleType, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          (vehicle as any).sNo = serialNumber;
          this.tableData.push(vehicle);
        }
      });

      // Met à jour le dataSource sans le recréer
      if (!this.dataSource) {
        this.dataSource = new MatTableDataSource<VehicleType>(this.tableData);
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

    trackById(index: number, item: VehicleType): number {
        return item.id ?? index;
      }
    confirmRestore(id: number): void {
      this.selectedRestoreId = id;

      const modalEl = document.getElementById('restore_modal_vehicle_type');
      if (modalEl) {
        const modalInstance = new bootstrap.Modal(modalEl);
        modalInstance.show();
      }
    }
    restoreSelectedVehicle(): void {
      if (!this.selectedRestoreId) return;
      this.vehicleTypeService.restoreVehicleType(this.selectedRestoreId).subscribe({
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
