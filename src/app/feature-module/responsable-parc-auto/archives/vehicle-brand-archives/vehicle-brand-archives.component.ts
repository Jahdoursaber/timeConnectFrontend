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
import { VehicleBrand } from '../../../../models/vehicleBrand';
import { VehicleBrandService } from '../../../../services/vehicleBrand/vehicle-brand.service';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastUtilService } from '../../../../services/toastUtil/toast-util.service';
declare var bootstrap: any;
@Component({
  selector: 'app-vehicle-brand-archives',
  standalone: false,
  templateUrl: './vehicle-brand-archives.component.html',
  styleUrl: './vehicle-brand-archives.component.scss'
})
export class VehicleBrandArchivesComponent {
  public routes = routes;
      initChecked = false;
      loading = false;
      private tablePageSizeSubscription?: Subscription;
      // pagination variables
      public pageSize = 10;
      public tableData: VehicleBrand[] = [];
      public tableDataCopy: VehicleBrand[] = [];
      public vehicles_brands: VehicleBrand[] = [];
      public actualData: VehicleBrand[] = [];
      public currentPage = 1;
      public skip = 0;
      public limit: number = this.pageSize;
      public serialNumberArray: number[] = [];
      public totalData = 0;
      showFilter = false;
      public pageSelection: pageSelection[] = [];
      dataSource!: MatTableDataSource<VehicleBrand>;
      public searchDataValue = '';
      breadCrumbItems: breadCrumbItems[] = [];
      selectedRestoreId?: number;
      constructor(
        private vehicleBrandService: VehicleBrandService,
        private router: Router,
        private pagination: PaginationService,
        private messageService: MessageService,
        private toast: ToastUtilService
      ) {
        this.breadCrumbItems = [
          { label: 'Archives' },
          { label: 'Marques', active: true },
        ];
      }

      ngOnInit(): void {
      this.fetchArchiveVehicleBrands();
    }
    ngOnDestroy(): void {
      // Nettoyez la souscription pour éviter des fuites
      if (this.tablePageSizeSubscription) {
        this.tablePageSizeSubscription.unsubscribe();
      }
    }
    private fetchArchiveVehicleBrands(): void {
        this.loading = true;
        this.vehicleBrandService
          .getArchiveVehicleBrands
          ()
          .subscribe((vehicles_brands: VehicleBrand[]) => {
            this.actualData = vehicles_brands;
            this.totalData = vehicles_brands.length;
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
        this.actualData.forEach((brand: VehicleBrand, index: number) => {
          const serialNumber = index + 1;
          if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
            (brand as any).sNo = serialNumber;
            this.tableData.push(brand);
          }
        });

        // Met à jour le dataSource sans le recréer
        if (!this.dataSource) {
          this.dataSource = new MatTableDataSource<VehicleBrand>(this.tableData);
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

      trackById(index: number, item: VehicleBrand): number {
          return item.id ?? index;
        }
      confirmRestore(id: number): void {
        this.selectedRestoreId = id;

        const modalEl = document.getElementById('restore_modal_vehicle_brand');
        if (modalEl) {
          const modalInstance = new bootstrap.Modal(modalEl);
          modalInstance.show();
        }
      }
      restoreSelectedVehicleBrand(): void {
        if (!this.selectedRestoreId) return;
        this.vehicleBrandService.restoreVehicleBrand(this.selectedRestoreId).subscribe({
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

