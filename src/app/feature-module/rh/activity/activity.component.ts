import { Component, HostListener, OnDestroy } from '@angular/core';

import { routes } from '../../../shared/routes/routes';
import { breadCrumbItems, pageSelection } from '../../../shared/models/models';
import { Activity } from '../../../models/activity';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PaginationService, tablePageSize } from '../../../shared/custom-pagination/pagination.service';
import { Sort } from '@angular/material/sort';
import { ActivityService } from '../../../services/activity.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user/user.service';
import { ToastUtilService } from '../../../services/toastUtil/toast-util.service';
declare var bootstrap: any;
@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss',
  standalone: false
})
export class ActivityComponent implements OnDestroy {
  public routes = routes;

  // pagination variables
  pageSize = 10;
  tableData: Activity[] = [];
  tableDataCopy: Activity[] = [];
  actualData: Activity[] = [];
  public currentPage = 1;
  public skip = 0;
  public limit: number = this.pageSize;
  serialNumberArray: number[] = [];
  totalData = 0;
  showFilter = false;
  public pageSelection: pageSelection[] = [];
  dataSource!: MatTableDataSource<Activity>;
  public searchDataValue = '';
  breadCrumbItems: breadCrumbItems[] = [];
  isOpen = false
  myFormActivity!: FormGroup;
  selectedActivity!: Activity;
  isEditMode: boolean = false;
  editingId?: number;
  selectedDeleteId?: number;
  supervisors: User[] = [];
  globalErrorMessage: string = '';
  globalSuccessMessage: string = '';
  selectedUnassignActivityId?: number;
  ngOnDestroy(): void {
    this.isOpen = false
  }

  constructor(
    private activityService: ActivityService,
    private router: Router,
    private pagination: PaginationService,
    private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastUtilService
  ) {
    this.breadCrumbItems = [
      { label: 'Entreprise/Activités' },
      { label: 'Activités', active: true }
    ];

  }


  ngOnInit(): void {
    this.loadActivities();
    this.loadUnssignedSupervisors();
    this.myFormActivity = this.fb.group({
      ActivityName: ['', Validators.required],
      supervisor_id: [null]
    });

  }
  openAddModal(): void {
    this.myFormActivity.reset();
    this.isEditMode = false;
    this.editingId = undefined;
    const modalEl = document.getElementById('add_activity');
    if (modalEl) {
      const modalInstance = new bootstrap.Modal(modalEl);
      modalInstance.show();
    }
  }
  loadActivities(): void {
    this.activityService.getAllActivity().subscribe((activities: Activity[]) => {
      console.log(activities);
      this.actualData = activities;
      this.totalData = activities.length;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.activities) {
          this.getTableData({ skip: res.skip, limit: res.limit });
          this.pageSize = res.pageSize;
        }
      });
    });
  }
  private getTableData(pageOption: pageSelection): void {
    this.activityService.getAllActivity().subscribe((activities: Activity[]) => {
      this.tableData = [];
      this.tableDataCopy = [];
      this.serialNumberArray = [];
      this.actualData.forEach((activity: Activity, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          (activity as any).sNo = serialNumber; // Ajouter le numéro de série
          this.tableData.push(activity);
          this.tableDataCopy.push(activity);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<Activity>(this.actualData);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        tableDataCopy: this.tableDataCopy,
        serialNumberArray: this.serialNumberArray,

      });

    });
  }
  onSubmit(): void {
    this.globalErrorMessage = '';
    if (this.myFormActivity.valid) {
      const payload: Activity = {
        activity_name: this.myFormActivity.value.ActivityName,
        supervisor_id: this.myFormActivity.value.supervisor_id
      };
      if (this.isEditMode && this.editingId) {
        // UPDATE
        this.activityService.updateActivity(this.editingId, payload).subscribe({
          next: (updated) => {
            const index = this.tableData.findIndex(a => a.id === this.editingId);
            if (index !== -1) {
              this.tableData[index] = updated;
              this.dataSource.data = [...this.tableData];
            }
            this.resetFormAndCloseModal();
            this.toast.showSuccess('Modification effectuée avec succès ! ✅');
          },
          error: (err) => {
            this.resetFormAndCloseModal();
            if (err.status === 401) {
              this.globalErrorMessage = 'Cette activité existe déjà';
            } else if (err.status === 422) {
              this.globalErrorMessage = 'Erreur de validation : champ requis';
            } else {
              this.globalErrorMessage = 'Erreur serveur, veuillez réessayer';
            }
            setTimeout(() => this.globalErrorMessage = '', 6000);
          }
        });
      }
      else {
        this.activityService.addActivity(payload).subscribe({
          next: (newActivity) => {
            this.actualData.unshift(newActivity);
            this.tableData.unshift(newActivity);
            this.dataSource.data = this.tableData;
            this.serialNumberArray = this.tableData.map((_, i) => i + 1);
            this.totalData++;
            this.resetFormAndCloseModal();
            this.toast.showSuccess('Ajout effectué avec succès ! ✅');

          },
          error: (err) => {
            this.resetFormAndCloseModal();
            if (err.status === 401) {
              this.globalErrorMessage = 'Cette activité existe déjà';
            } else if (err.status === 422) {
              this.globalErrorMessage = 'Erreur de validation : champ requis';
            } else {
              this.globalErrorMessage = 'Erreur serveur, veuillez réessayer';
            }
            setTimeout(() => this.globalErrorMessage = '', 6000);
          }
        });
      }
    } else {
      this.myFormActivity.markAllAsTouched();
    }
  }
  private resetFormAndCloseModal(): void {
    this.myFormActivity.reset();
    this.isEditMode = false;
    this.editingId = undefined;


    const modalEl = document.getElementById('add_activity');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();
    }
  }
  public searchData(value: string): void {
    if (value == '') {
      this.tableData = this.tableDataCopy;
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

  loadActivityById(id: number): void {
    this.activityService.getActivityById(id).subscribe({
      next: (activity) => {
        this.myFormActivity.patchValue({
          ActivityName: activity.activity_name
        });

        this.isEditMode = true;
        this.editingId = activity.id;

        const modalEl = document.getElementById('add_activity');
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

  confirmDelete(id: number): void {
    this.selectedDeleteId = id;

    const modalEl = document.getElementById('delete_modal_activity');
    if (modalEl) {
      const modalInstance = new bootstrap.Modal(modalEl);
      modalInstance.show();
    }
  }
  deleteSelectedActivity(): void {
    if (!this.selectedDeleteId) return;

    this.activityService.deleteActivity(this.selectedDeleteId).subscribe({
      next: () => {
        // Supprimer de la liste
        this.tableData = this.tableData.filter(activity => activity.id !== this.selectedDeleteId);
        this.actualData = this.actualData.filter(activity => activity.id !== this.selectedDeleteId);

        // Recalcul numéros de série
        this.serialNumberArray = this.tableData.map((_, i) => i + 1);
        this.dataSource.data = [...this.tableData];
        this.totalData--;
        this.toast.showSuccess('Suppression effectuée avec succès ✅');
        this.globalErrorMessage = '';

        this.selectedDeleteId = undefined;
      },
      error: (err) => {
        let msg = "Une erreur est survenue lors de la suppression.";
        if (err.status === 409) {
          if (err.error?.error_code === 'ACTIVITY_HAS_USERS') {
            msg = "Impossible de supprimer : l’activité est associée à au moins un utilisateur.";
          } else if (err.error?.error_code === 'ACTIVITY_HAS_SUPERVISOR') {
            msg = "Impossible de supprimer : un superviseur est encore affecté à cette activité.";
          } else {
            msg = err.error?.message || msg;
          }
        } else if (err.status === 404) {
          msg = "Impossible de supprimer : activité introuvable.";
        }
        this.globalErrorMessage = msg;
        setTimeout(() => this.globalErrorMessage = '', 6000);
        this.selectedDeleteId = undefined
      }
    });
  }
  loadUnssignedSupervisors() {
    this.userService.getUnssignedSupervisor().subscribe({
      next: (supervisors: User[]) => {
        this.supervisors = supervisors;
      },
      error: (err) => {
        console.error("Erreur lors du chargement des superviseurs :", err);
      }
    });
  }

  //---désaffecter le superviseur---//
  confirmUnassignSupervisor(activityId: number): void {
    this.selectedUnassignActivityId = activityId;

    const modalEl = document.getElementById('unassign_supervisor_modal');
    if (modalEl) {
      const modalInstance = new bootstrap.Modal(modalEl);
      modalInstance.show();
    }
  }
  unassignSelectedSupervisor(): void {
    if (!this.selectedUnassignActivityId) return;

    this.activityService.unassignSupervisor(this.selectedUnassignActivityId).subscribe({
      next: (response) => {
        this.toast.showSuccess(response.message || 'Superviseur désaffecté avec succès ! ✅');
        this.selectedUnassignActivityId = undefined;
        this.loadActivities();
        // const modalEl = document.getElementById('unassign_supervisor_modal');
        // if (modalEl) {
        //   const modalInstance = bootstrap.Modal.getInstance(modalEl);
        //   modalInstance?.hide();
        // }
      },
      error: (err) => {
        let msg = "Une erreur est survenue lors de la désaffectation.";
        if (err.status === 409 && err.error?.error_code === 'ACTIVITY_HAS_TECHNICIANS') {
          msg = err.error.message;
        }
        this.globalErrorMessage = msg;
        setTimeout(() => this.globalErrorMessage = '', 6000);
        this.selectedUnassignActivityId = undefined;
        // Fermer la modale même si erreur
        // const modalEl = document.getElementById('unassign_supervisor_modal');
        // if (modalEl) {
        //   const modalInstance = bootstrap.Modal.getInstance(modalEl);
        //   modalInstance?.hide();
        // }
      }
    });
  }
  goToTechniciansByActivity(activityName: string, activityId: number): void {
    // Naviguer vers la page UserComponent avec filtre par activité (query params)
    this.router.navigate(['/rh/techniciens'], {
      queryParams: { activity: activityId, activityName }
    });
  }

} 
