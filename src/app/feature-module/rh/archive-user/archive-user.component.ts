
import { Component, OnInit } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { breadCrumbItems, pageSelection } from '../../../shared/models/models';
import { PaginationService, tablePageSize } from '../../../shared/custom-pagination/pagination.service';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user/user.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageService } from 'primeng/api';
import { ToastUtilService } from '../../../services/toastUtil/toast-util.service';
declare var bootstrap: any;
@Component({
  selector: 'app-archive-user',
  standalone: false,
  templateUrl: './archive-user.component.html',
  styleUrl: './archive-user.component.scss'
})
export class ArchiveUserComponent implements OnInit {
  public routes = routes;
  initChecked = false;
  loading = false;
  private tablePageSizeSubscription?: Subscription;
  // pagination variables
  public pageSize = 10;
  public tableData: User[] = [];
  public tableDataCopy: User[] = [];
  public users: User[] = [];
  public actualData: User[] = [];
  public currentPage = 1;
  public skip = 0;
  public limit: number = this.pageSize;
  public serialNumberArray: number[] = [];
  public totalData = 0;
  showFilter = false;
  public pageSelection: pageSelection[] = [];
  dataSource!: MatTableDataSource<User>;
  public searchDataValue = '';
  breadCrumbItems: breadCrumbItems[] = [];
  selectedRestoreId?: number;
  constructor(
    private userService: UserService,
    private router: Router,
    private pagination: PaginationService,
    private messageService: MessageService,
    private toast: ToastUtilService
  ) {
    this.breadCrumbItems = [
      { label: 'Archives' },
      { label: 'Anciens personnels', active: true }
    ];

  }

  ngOnInit(): void {
    this.fetchArchiveUsers();
  }
  ngOnDestroy(): void {
    // Nettoyez la souscription pour éviter des fuites
    if (this.tablePageSizeSubscription) {
      this.tablePageSizeSubscription.unsubscribe();
    }
  }
  private fetchArchiveUsers(): void {
      this.loading = true;
      this.userService.getArchiveUsers().subscribe((users: User[]) => {
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
  confirmRestore(id: number): void {
    this.selectedRestoreId = id;

    const modalEl = document.getElementById('restore_modal_user');
    if (modalEl) {
      const modalInstance = new bootstrap.Modal(modalEl);
      modalInstance.show();
    }
  }
  restoreSelectedUser(): void {
  if (!this.selectedRestoreId) return;
  this.userService.restoreUser(this.selectedRestoreId).subscribe({
    next: res => {
      this.tableData = this.tableData.filter(user => user.id !== this.selectedRestoreId);
        this.actualData = this.actualData.filter(user => user.id !== this.selectedRestoreId);

        // Recalcul numéros de série
        this.serialNumberArray = this.tableData.map((_, i) => i + 1);
        this.dataSource.data = [...this.tableData];
        this.totalData--;
        this.toast.showSuccess('Suppression effectuée avec succès ✅');
        this.selectedRestoreId = undefined;
    },
    error: err => {
      // Affiche une alerte ou un toast d’erreur
    }
  });
}
}
