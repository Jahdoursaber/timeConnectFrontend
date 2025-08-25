import { Component, OnInit } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { breadCrumbItems, pageSelection } from '../../../shared/models/models';
import { PaginationService, tablePageSize } from '../../../shared/custom-pagination/pagination.service';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { AdvanceRequest } from '../../../models/advanceRequest';
import { RequestAdvanceService } from '../../../services/request-advance/request-advance.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageService } from 'primeng/api';
declare var bootstrap: any;
@Component({
  selector: 'app-advance-request',
  standalone: false,
  templateUrl: './advance-request.component.html',
  styleUrl: './advance-request.component.scss',
  providers: [MessageService],
})
export class AdvanceRequestComponent implements OnInit {
  public routes = routes;
  initChecked = false;
  loading = false;
  private tablePageSizeSubscription?: Subscription;
  // pagination variables
  public pageSize = 10;
  public tableData: AdvanceRequest[] = [];
  public tableDataCopy: AdvanceRequest[] = [];
  public advances: AdvanceRequest[] = [];
  public actualData: AdvanceRequest[] = [];
  public currentPage = 1;
  public skip = 0;
  public limit: number = this.pageSize;
  public serialNumberArray: number[] = [];
  public totalData = 0;
  showFilter = false;
  public pageSelection: pageSelection[] = [];
  dataSource!: MatTableDataSource<AdvanceRequest>;
  public searchDataValue = '';
  breadCrumbItems: breadCrumbItems[] = [];
  statusOptions: AdvanceRequest[] = [];
  statusOptionsForForm: AdvanceRequest[] = [];
  selectedStatus: string | null = null;
  editingId?: number;
  myFormAdvance!: FormGroup;
  advanceStats = {
  accepted: 0,
  rejected: 0,
  pending: 0
};
  constructor(
    private advanceService: RequestAdvanceService,
    private router: Router,
    private pagination: PaginationService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private messageService: MessageService
  ) {
    this.breadCrumbItems = [
      { label: 'Demandes' },
      { label: 'Demande d\'acompte', active: true }
    ];

  }
  ngOnInit(): void {
    this.getAllAdvanceRequests();
    this.loadAdvanceStats();
    this.loadStatusOptions();
    this.myFormAdvance = this.fb.group({
      full_name: [{ value: '', disabled: true }],
      amount: [{ value: '', disabled: true }],
      message: [{ value: '', disabled: true }],
      reply: [''],
      status: ['', Validators.required]
    });
  }
  ngOnDestroy(): void {
    // Nettoyez la souscription pour éviter des fuites
    if (this.tablePageSizeSubscription) {
      this.tablePageSizeSubscription.unsubscribe();
    }
  }
  private getAllAdvanceRequests(): void {
    this.loading = true;
    this.advanceService.getAdvanceRequests().subscribe((advances: AdvanceRequest[]) => {
      this.actualData = advances;
      this.totalData = advances.length;
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
    this.actualData.forEach((advance: AdvanceRequest, index: number) => {
      const serialNumber = index + 1;
      if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
        (advance as any).sNo = serialNumber;
        this.tableData.push(advance);
      }
    });

    // Met à jour le dataSource sans le recréer
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource<AdvanceRequest>(this.tableData);
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

  trackById(index: number, item: AdvanceRequest): number {
    return item.id;
  }
  private loadStatusOptions(): void {
    this.advanceService.getStatusOptions().subscribe({
      next: (options) => {
        console.log('Options reçues :', options); // 👈 debug
        this.statusOptions = options;
        this.statusOptionsForForm = options.filter(opt => opt.value !== 'pending');
      },
      error: (err) => {
        console.error('Erreur lors du chargement :', err);
      }
    });
  }
  loadAdvanceById(id: number): void {
    this.advanceService.getAdvanceById(id).subscribe({
      next: (advance) => {
        this.editingId = advance.id;
        this.myFormAdvance.patchValue({
          full_name: `${advance.first_name} ${advance.last_name}`,
          amount: advance.amount,
          message: advance.message,
        });

        const modalEl = document.getElementById('edit_advance_id');
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
  onSubmit(): void {
    if (this.myFormAdvance.valid && this.editingId) {
      const { reply, status } = this.myFormAdvance.value;
      this.advanceService.updateAdvanceRequest(this.editingId, { reply, status }).subscribe({
        next: (updatedAdvance) => {
          const index = this.tableData.findIndex(item => item.id === this.editingId);
          if (index !== -1) {
            this.tableData[index] = { ...this.tableData[index], ...updatedAdvance };
            this.dataSource.data = [...this.tableData];
          }

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
      this.myFormAdvance.markAllAsTouched();
    }


  }
  private resetFormAndCloseModal(): void {
    this.myFormAdvance.reset();
    this.editingId = undefined;
    const modalEl = document.getElementById('edit_advance_id');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();
    }
  }
  getStatusClasses(status: string): { bgClass: string; textClass: string } {
  switch (status) {
    case 'accepted':
      return {
        bgClass: 'bg-transparent-success',
        textClass: 'text-success'
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
    this.advanceService.filterAdvanceRequestsByStatus(status).subscribe({
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
  this.getAllAdvanceRequests();
}
getSelectedStatusLabel(): string {
  if (!this.selectedStatus) return 'Select Status';

  const found = this.statusOptions.find(opt => opt.value === this.selectedStatus);
  return found?.label ?? 'Select Status';
}
loadAdvanceStats(): void {
  this.advanceService.getAdvanceStats().subscribe({
    next: (stats) => {
      this.advanceStats = stats;
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
