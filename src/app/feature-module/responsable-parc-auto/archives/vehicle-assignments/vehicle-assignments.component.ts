import { Component, OnInit } from '@angular/core';
import { VehicleAssignmentHistory } from '../../../../models/vehicleAssignmentHistory';
import {
  breadCrumbItems,
  pageSelection,
} from '../../../../shared/models/models';
import { MatTableDataSource } from '@angular/material/table';
import { routes } from '../../../../shared/routes/routes';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { VehicleService } from '../../../../services/vehicle/vehicle.service';
import {
  PaginationService,
  tablePageSize,
} from '../../../../shared/custom-pagination/pagination.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { User } from '../../../../models/user';
import { Vehicle } from '../../../../models/vehicle';
import { UserService } from '../../../../services/user/user.service';
declare var bootstrap: any;
@Component({
  selector: 'app-vehicle-assignments',
  standalone: false,
  templateUrl: './vehicle-assignments.component.html',
  styleUrl: './vehicle-assignments.component.scss',
})
export class VehicleAssignmentsComponent implements OnInit {
  public routes = routes;
  initChecked = false;
  loading = false;
  private tablePageSizeSubscription?: Subscription;
  // pagination variables
  public pageSize = 10;
  public tableData: VehicleAssignmentHistory[] = [];
  public tableDataCopy: VehicleAssignmentHistory[] = [];
  public vehicle_assigments: VehicleAssignmentHistory[] = [];
  public technicians: User[] = [];
  public vehicles: Vehicle[] = [];
  public actualData: VehicleAssignmentHistory[] = [];
  public currentPage = 1;
  public skip = 0;
  public limit: number = this.pageSize;
  public serialNumberArray: number[] = [];
  public totalData = 0;
  selectedDeleteId?: number;
  showFilter = false;
  public pageSelection: pageSelection[] = [];
  dataSource!: MatTableDataSource<VehicleAssignmentHistory>;
  public searchDataValue = '';
  breadCrumbItems: breadCrumbItems[] = [];
  isEditMode: boolean = false;
  editingId?: number;
  filterForm!: FormGroup;
  public formErrorMessage: string = '';
  isOpen = false;
  constructor(
    private vehicleService: VehicleService,
    private pagination: PaginationService,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.breadCrumbItems = [
      { label: 'dashboard' },
      { label: "Historique d'affectation", active: true },
    ];
  }
  ngOnInit(): void {
    this.filterForm = this.fb.group({
      technicien_id: [0],
      vehicule_id: [0],
      mois_annee: [this.getDefaultMonth()],
    });

    this.vehicleService.getVehicles()
      .subscribe((vehicles) => (this.vehicles = vehicles));
      this.userService.getAllTechnicians()
      .subscribe((technicians) => (this.technicians = technicians));
      this.onSearchHistory();
  }

  ngOnDestroy(): void {
    // Nettoyez la souscription pour éviter des fuites
    if (this.tablePageSizeSubscription) {
      this.tablePageSizeSubscription.unsubscribe();
      this.isOpen = false;
    }
  }
  getDefaultMonth(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  onSearchHistory(): void {
    const formValue = this.filterForm.value;
    let mois = 0,
      annee = 0;
    if (formValue.mois_annee) {
      const [y, m] = formValue.mois_annee.split('-');
      mois = parseInt(m, 10);
      annee = parseInt(y, 10);
    }
    const filters: any = {};
    if (formValue.technicien_id && formValue.technicien_id != 0)
      filters.technicien_id = formValue.technicien_id;
    if (formValue.vehicule_id && formValue.vehicule_id != 0)
      filters.vehicule_id = formValue.vehicule_id;
    if (mois && annee) {
      filters.mois = mois;
      filters.annee = annee;
    }
    this.loading = true;
    this.vehicleService.getVehicleAssigmentHistory(filters).subscribe({
      next: (assignments) => {
        console.log(assignments);
        this.actualData = assignments;
        this.totalData = assignments.length;
        this.tableDataCopy = [...assignments];
        this.getTableData({ skip: this.skip, limit: this.limit });
        this.loading = false;
      },
      error: (err) => {
        this.actualData = [];
        this.tableData = [];
        this.loading = false;
        console.log(err);
      },
    });
  }

  private getTableData(pageOption: pageSelection): void {
    this.tableData = [];
    this.serialNumberArray = [];
    this.actualData.forEach(
      (vehicle_assigment: VehicleAssignmentHistory, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          (vehicle_assigment as any).sNo = serialNumber;
          this.tableData.push(vehicle_assigment);
        }
      }
    );

    // Met à jour le dataSource sans le recréer
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource<VehicleAssignmentHistory>(
        this.tableData
      );
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

  trackById(index: number, item: VehicleAssignmentHistory): number {
    return item.id ?? index;
  }
}
