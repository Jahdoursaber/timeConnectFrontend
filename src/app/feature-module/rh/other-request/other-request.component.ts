import { Component, OnInit } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { breadCrumbItems, pageSelection } from '../../../shared/models/models';
import { PaginationService, tablePageSize } from '../../../shared/custom-pagination/pagination.service';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Sort } from '@angular/material/sort';
import { OtherRequest } from '../../../models/otherRequest';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OtherRequestService } from '../../../services/other-request/other-request.service';
import { MessageService } from 'primeng/api';
declare var bootstrap: any;
@Component({
  selector: 'app-other-request',
  standalone: false,
  templateUrl: './other-request.component.html',
  styleUrl: './other-request.component.scss',
  providers: [MessageService],
})
export class OtherRequestComponent implements OnInit {
  public routes = routes;
  initChecked = false;
  loading = false;
  private tablePageSizeSubscription?: Subscription;
  public pageSize = 10;
  public tableData: OtherRequest[] = [];
  public tableDataCopy: OtherRequest[] = [];
  public other_requests: OtherRequest[] = [];
  public actualData: OtherRequest[] = [];
  public currentPage = 1;
  public skip = 0;
  public limit: number = this.pageSize;
  public serialNumberArray: number[] = [];
  public totalData = 0;
  showFilter = false;
  public pageSelection: pageSelection[] = [];
  dataSource!: MatTableDataSource<OtherRequest>;
  breadCrumbItems: breadCrumbItems[] = [];
  statusOptions: OtherRequest[] = [];
  statusOptionsForForm: OtherRequest[] = [];
  selectedStatus: string | null = null;
  editingId?: number;
  myFormOtherRequest!: FormGroup;
  fileErrors: { [key: string]: string } = {
    reply_file: '',
  };
  public searchDataValue = '';
  otherRequestStats = {
  total: 0,
  replied: 0,
  not_replied: 0
};
replyStatusOptions = [
  { label: 'Répondu', value: true },
  { label: 'Non répondu', value: false }
];

selectedReplyStatus: boolean | null = null;
  constructor(
    private otherService: OtherRequestService,
    private router: Router,
    private pagination: PaginationService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.breadCrumbItems = [
      { label: 'Demandes' },
      { label: 'Autres Demandes', active: true }
    ];

  }
  ngOnInit(): void {
    this.loadAdvanceStats();
    this.getAllOtherRequests();
    this.myFormOtherRequest = this.fb.group({
      full_name: [{ value: '', disabled: true }],
      message: [{ value: '', disabled: true }],
      reply: ['', Validators.required],
      reply_file: [null],
    });
  }
  ngOnDestroy(): void {
    // Nettoyez la souscription pour éviter des fuites
    if (this.tablePageSizeSubscription) {
      this.tablePageSizeSubscription.unsubscribe();
    }
  }
  private getAllOtherRequests(): void {
    this.loading = true;
    this.otherService.getOtherRequests().subscribe((other_requests: OtherRequest[]) => {
      this.actualData = other_requests;
      this.totalData = other_requests.length;
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
    this.actualData.forEach((other_request: OtherRequest, index: number) => {
      const serialNumber = index + 1;
      if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
        (other_request as any).sNo = serialNumber;
        this.tableData.push(other_request);
      }
    });

    // Met à jour le dataSource sans le recréer
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource<OtherRequest>(this.tableData);
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
  trackById(index: number, item: OtherRequest): number {
    return item.id;
  }
  loadOtherRequestById(id: number): void {
    this.otherService.getOtherRequestById(id).subscribe({
      next: (other_request) => {
        this.editingId = other_request.id;
        this.myFormOtherRequest.patchValue({
          full_name: `${other_request.first_name} ${other_request.last_name}`,
          message: other_request.message,
        });

        const modalEl = document.getElementById('edit_other_id');
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
  private resetFormAndCloseModal(): void {
    this.myFormOtherRequest.reset();
    this.editingId = undefined;
    const modalEl = document.getElementById('edit_other_id');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();
    }
  }
  onFileChange(event: Event, controlName: 'reply_file'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.fileErrors[controlName] = '';
      this.myFormOtherRequest.get(controlName)?.setValue(null);
      return;
    }

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      this.fileErrors[controlName] = 'Format invalide. Seuls JPG, PNG ou PDF sont autorisés.';
      this.myFormOtherRequest.get(controlName)?.setValue(null);
      return;
    }

    if (file.size > maxSize) {
      this.fileErrors[controlName] = 'Le fichier ne doit pas dépasser 2 Mo.';
      this.myFormOtherRequest.get(controlName)?.setValue(null);
      return;
    }

    this.fileErrors[controlName] = '';
    this.myFormOtherRequest.get(controlName)?.setValue(file);
    console.log('Fichier sélectionné :', file);
  }

  onSubmit(): void {
    const fv = this.myFormOtherRequest.value;

    const otherRequestData: OtherRequest = {
      ...fv,
      reply_file: fv.reply_file,
    };
    console.log('Contenu du formulaire', this.myFormOtherRequest.value);
    console.log(this.editingId)
    if (this.myFormOtherRequest.valid && this.editingId) {
      // MISE À JOUR
      this.otherService.updateOtherRequest(this.editingId, otherRequestData).subscribe({
        next: (updated) => {
          // Remplace l’utilisateur dans vos tableaux
         const index = this.tableData.findIndex(item => item.id === this.editingId);
          if (index !== -1) {
            this.tableData[index] = { ...this.tableData[index], ...updated };
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
    }
    else {
      this.myFormOtherRequest.markAllAsTouched();
    }
  }
  loadAdvanceStats(): void {
  this.otherService.getOtherRequestStats().subscribe({
    next: (stats) => {
      console.log('📊 Réponse API reçue :', stats);
      this.otherRequestStats = stats;
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
filterByRepliedStatus(status: boolean): void {
  this.loading = true;
  this.selectedReplyStatus = status;

  this.otherService.filterOtherRequestsByReplied(status).subscribe({
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
    error: () => {
      this.loading = false;
      this.messageService.add({
        summary: 'Erreur',
        detail: 'Impossible de filtrer les demandes',
        severity: 'error'
      });
    }
  });
}
resetRepliedFilter(): void {
  this.selectedReplyStatus = null;
  this.getAllOtherRequests(); // Recharge la liste complète
}
}
