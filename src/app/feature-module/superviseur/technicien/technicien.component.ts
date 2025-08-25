import { Component, OnDestroy, OnInit } from '@angular/core';
import { Role } from '../../../shared/data/role';
import { User } from '../../../models/user';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { UserService } from '../../../services/user/user.service';
import { MatTableDataSource } from '@angular/material/table';
import { PaginationService, tablePageSize } from '../../../shared/custom-pagination/pagination.service';
import { breadCrumbItems, pageSelection } from '../../../shared/models/models';
import { routes } from '../../../shared/routes/routes';
import { Sort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastUtilService } from '../../../services/toastUtil/toast-util.service';
declare var bootstrap: any;
@Component({
  selector: 'app-technicien',
  standalone: false,
  templateUrl: './technicien.component.html',
  styleUrl: './technicien.component.scss'
})
export class TechnicienComponent implements OnInit, OnDestroy{
  public routes = routes;
  role!: Role;
  pageSize = 10;
  tableData: User[] = [];
  tableDataCopy: User[] = [];
  users: User[] = [];
  public currentPage = 1;
  public skip = 0;
  public limit: number = this.pageSize;
  serialNumberArray: number[] = [];
  totalData = 0;
  showFilter = false;
  public pageSelection: pageSelection[] = [];
  dataSource!: MatTableDataSource<User>;
  public searchDataValue = '';
  loading = false;
  breadCrumbItems: breadCrumbItems[] = [];
  actualData: User[] = [];
  private tablePageSizeSubscription?: Subscription;
  selectedTechnicienId ?: number
  globalErrorMessage: string = '';
  constructor(
      private route: ActivatedRoute,
      private userService: UserService,
      private pagination: PaginationService,
      private router: Router,
      private fb: FormBuilder,
      private toast: ToastUtilService
    ) {
      this.breadCrumbItems = [
        { label: 'Superviseurs' },
        { label: 'Utilisateurs', active: true }
      ];
    }
     ngOnInit(): void {
      this.loadTechniciens();
     }

     ngOnDestroy(): void {

    if (this.tablePageSizeSubscription) {
      this.tablePageSizeSubscription.unsubscribe();
    }
  }

  private loadTechniciens(): void {
    this.loading = true;
    this.userService.getTechniciensBySupervisor().subscribe((users: User[]) => {
      this.actualData = users;
      this.totalData = users.length;
      this.tableDataCopy = [...this.actualData];
      if (this.tablePageSizeSubscription) {
        this.tablePageSizeSubscription.unsubscribe();
      }
      this.tablePageSizeSubscription = this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        this.getTableData({ skip: res.skip, limit: res.limit });
        this.pageSize = res.pageSize;
      });
      this.loading = false;
    });
  }

  private getTableData(pageOption: pageSelection): void {
    this.tableData = [];
    this.serialNumberArray = [];
    this.actualData.forEach((user: User, index: number) => {
      const serialNumber = index + 1;
      if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
        (user as any).sNo = serialNumber;
        this.tableData.push(user);
      }
    });

    // Met à jour le dataSource sans le recréer
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource<User>(this.tableData);
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
      this.tableData = [...this.tableDataCopy];;
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
  trackById(index: number, item: User): number {
    return item.id;
  }
  confirmAffectTechnicien(technicienId: number): void {
    this.selectedTechnicienId = technicienId;

    const modalEl = document.getElementById('unassign_supervisor_modal');
    if (modalEl) {
      const modalInstance = new bootstrap.Modal(modalEl);
      modalInstance.show();
    }
  }
  affectActivityToTechnicien(): void {
    if (!this.selectedTechnicienId) return;

    this.userService.AffectActitivyToTechnicien(this.selectedTechnicienId).subscribe({
      next: (response) => {
        this.toast.showSuccess(response.message || 'Technicien affecté avec succès ! ✅');
        this.selectedTechnicienId = undefined;
        this.loadTechniciens();

      },
      error: (err) => {
        let msg = "Une erreur est survenue lors de la désaffectation.";
        if (err.status === 409 && err.error?.error_code === 'ACTIVITY_HAS_TECHNICIANS') {
          msg = err.error.message;
        }
        this.globalErrorMessage = msg;
        setTimeout(() => this.globalErrorMessage = '', 6000);
        this.selectedTechnicienId = undefined;

      }
    });
  }
}
