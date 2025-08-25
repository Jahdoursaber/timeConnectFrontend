import { Component, OnInit } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { breadCrumbItems, pageSelection } from '../../../shared/models/models';
import { PaginationService, tablePageSize } from '../../../shared/custom-pagination/pagination.service';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { Leave } from '../../../models/leave';
import { LeaveService } from '../../../services/leave/leave.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageService } from 'primeng/api';
import { LeaveType } from '../../../models/leaveType';
declare var bootstrap: any;
@Component({
  selector: 'app-leave',
  standalone: false,
  templateUrl: './leave.component.html',
  styleUrl: './leave.component.scss'
})
export class LeaveComponent implements OnInit {
  public routes = routes;

    loading = false;
    private tablePageSizeSubscription?: Subscription;
    // pagination variables
    public pageSize = 10;
    public tableData: Leave[] = [];
    public tableDataCopy: Leave[] = [];
    public leaves: Leave[] = [];
    public actualData: Leave[] = [];
    public currentPage = 1;
    public skip = 0;
    public limit: number = this.pageSize;
    public serialNumberArray: number[] = [];
    public totalData = 0;
    showFilter = false;
    public pageSelection: pageSelection[] = [];
    dataSource!: MatTableDataSource<Leave>;
    public searchDataValue = '';
    breadCrumbItems: breadCrumbItems[] = [];
    statusOptions: Leave[] = [];
    statusOptionsForForm: Leave[] = [];
    selectedStatus: string | null = null;
    LeavesStats={
      acceptedL1: 0,
      acceptedL2:0,
      rejected: 0,
      pending: 0,
      proposed_other_date:0
    };
    editingId?: number;
    myFormLeave!: FormGroup;
    leaves_types: LeaveType[] = [];
    selectedLeaveType:number |null=null;
    constructor(
        private leaveService: LeaveService,
        private router: Router,
        private pagination: PaginationService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private messageService: MessageService
      ) {
        this.breadCrumbItems = [
          { label: 'Demandes' },
          { label: 'Demandes des congés', active: true }
        ];

      }

    ngOnInit(): void {
      this.getAllLeavesSuperviseur();
      this.loadStatusOptions();
      this.getLeavesType();
      this.loadLeavesStats();
      this.myFormLeave = this.fb.group({
      full_name: [{ value: '', disabled: true }],
      start: [{ value: '', disabled: true }],
      end: [{ value: '', disabled: true }],
      message: [{ value: '', disabled: true }],
      reply: [''],
      status: ['', Validators.required]
    });
  }
  ngOnDestroy(): void {
    if (this.tablePageSizeSubscription) {
      this.tablePageSizeSubscription.unsubscribe();
    }
  }

  private getAllLeavesSuperviseur(): void {
      this.loading = true;
      this.leaveService.getLeavesSuperviseur().subscribe((leaves: Leave[]) => {
        this.actualData = leaves;
        this.totalData = leaves.length;
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
      this.actualData.forEach((leave: Leave, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          (leave as any).sNo = serialNumber;
          this.tableData.push(leave);
        }
      });

      // Met à jour le dataSource sans le recréer
      if (!this.dataSource) {
        this.dataSource = new MatTableDataSource<Leave>(this.tableData);
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

    trackById(index: number, item: Leave): number {
      return item.id;
    }

    loadLeaveById(id: number): void {
    this.leaveService.getLeaveById(id).subscribe({
      next: (leave) => {
        this.editingId = leave.id;
        this.myFormLeave.patchValue({
          full_name: leave.full_name,
          start: leave.start,
          end: leave.end,
          message:leave.message
        });

        const modalEl = document.getElementById('edit_leave_id');
        if (modalEl) {
          const modalInstance = new bootstrap.Modal(modalEl);
          modalInstance.show();
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement :', err);
      }
    });
  }
  private loadStatusOptions(): void {
    this.leaveService.getStatusOptions().subscribe({
      next: (options) => {
        console.log('Options reçues :', options); 
        this.statusOptions = options;
        this.statusOptionsForForm = options.filter(opt => opt.value !== 'pending' && opt.value !== 'acceptedL2');
      },
      error: (err) => {
        console.error('Erreur lors du chargement :', err);
      }
    });
  }

  onSubmit(): void {
    if (this.myFormLeave.valid && this.editingId) {
      const { reply, status } = this.myFormLeave.value;
      this.leaveService.updateLeave(this.editingId, { reply, status }).subscribe({
        next: (updatedLeave) => {
          const index = this.tableData.findIndex(item => item.id === this.editingId);
          if (index !== -1) {
            this.tableData[index] = { ...this.tableData[index], ...updatedLeave };
            this.dataSource.data = [...this.tableData];
          }
          this.loadLeavesStats();
          this.resetFormAndCloseModal();
          this.messageService.add({
            summary: 'Succès',
            detail: 'Demande mise à jour avec succès ✅',
            severity: 'success',
            styleClass: 'success-light-popover'
          });
        },
        error: () => {
          this.messageService.add({
            summary: 'Erreur',
            detail: 'Erreur lors de la mise à jour ❌',
            severity: 'error',
            styleClass: 'danger-light-popover'
          });
        }
      });
    } else {
      this.myFormLeave.markAllAsTouched();
    }


  }
  private resetFormAndCloseModal(): void {
    this.myFormLeave.reset();
    this.editingId = undefined;
    const modalEl = document.getElementById('edit_leave_id');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();
    }
  }
  getStatusClasses(status: string): { bgClass: string; textClass: string } {
  switch (status) {
    case 'acceptedL1':
      return {
        bgClass: 'bg-transparent-success',
        textClass: 'text-success'
      };
    case 'acceptedL2':
      return {
        bgClass: 'bg-transparent-primary',
        textClass: 'text-primary'
      };
    case 'rejected':
      return {
        bgClass: 'bg-transparent-danger',
        textClass: 'text-danger'
      };
    case 'pending':
      return {
        bgClass: 'bg-transparent-purple',
        textClass: 'text-purple'
      };
    case 'proposed_other_date':
      return {
        bgClass: 'bg-transparent-warning',
        textClass: 'text-warning'
      };
    default:
      return {
        bgClass: 'bg-secondary',
        textClass: 'text-secondary'
      };
  }
}
filterByStatus(status: string): void {
    this.loading = true;
    this.selectedStatus = status;
    this.leaveService.filterLeavesByStatus(status).subscribe({
      next: (filtered) => {
        this.actualData = filtered;
        this.totalData = filtered.length;
        this.tableDataCopy = [...filtered];
        this.pagination.tablePageSize.next({
          skip: this.skip,
          limit: this.limit,
          pageSize: this.pageSize
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          summary: 'Erreur',
          detail: 'Impossible de filtrer par statut',
          severity: 'error',
          styleClass: 'danger-light-popover'
        });
      }
    });
  }
  resetFilters(): void {
  this.selectedStatus = null;
  this.selectedLeaveType = null;
  this.getAllLeavesSuperviseur();
}
getSelectedStatusLabel(): string {
  if (!this.selectedStatus) return 'Select Status';
  const found = this.statusOptions.find(opt => opt.value === this.selectedStatus);
  return found?.label ?? 'Select Status';
}
filterByLeaveType (leave_type_id:number):void {
    this.loading = true;
    this.selectedLeaveType = leave_type_id;
    this.leaveService.filterLeavesByLeaveType(leave_type_id).subscribe({
      next: (filtered) => {
        this.actualData = filtered;
        this.totalData = filtered.length;
        this.tableDataCopy = [...filtered];
        this.pagination.tablePageSize.next({
          skip: this.skip,
          limit: this.limit,
          pageSize: this.pageSize
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          summary: 'Erreur',
          detail: 'Impossible de filtrer par type de congé',
          severity: 'error',
          styleClass: 'danger-light-popover'
        });
      }
    });
  }
  getLeavesType(): void {
    this.leaveService.getLeavesTypes().subscribe((leaves_types: LeaveType[]) => {
      this.leaves_types = leaves_types;
    });
  }
  loadLeavesStats(): void {
  this.leaveService.getLeaveStats().subscribe({
    next: (stats) => {
      this.LeavesStats = stats;
    },
    error: () => {
      this.messageService.add({
        summary: 'Erreur',
        detail: 'Impossible de charger les statistiques',
        severity: 'error'
      });
    }
  });
}
}
