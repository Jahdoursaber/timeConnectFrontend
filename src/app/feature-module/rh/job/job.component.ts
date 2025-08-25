
import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';

import { routes } from '../../../shared/routes/routes';
import { breadCrumbItems, pageSelection } from '../../../shared/models/models';
import { Job } from '../../../models/job';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PaginationService, tablePageSize } from '../../../shared/custom-pagination/pagination.service';
import { Sort } from '@angular/material/sort';
import { JobService } from '../../../services/job.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var bootstrap: any;
@Component({
  selector: 'app-job',
  standalone: false,
  templateUrl: './job.component.html',
  styleUrl: './job.component.scss'
})
export class JobComponent {
  public routes = routes;

    // pagination variables
    pageSize = 10;
    tableData: Job[] = [];
    tableDataCopy: Job[] = [];
    actualData: Job[] = [];
    public currentPage = 1;
    public skip = 0;
    public limit: number = this.pageSize;
    serialNumberArray: number[] = [];
    totalData = 0;
    showFilter = false;
    public pageSelection: pageSelection[] = [];
    dataSource!: MatTableDataSource<Job>;
    public searchDataValue = '';
    breadCrumbItems: breadCrumbItems[] = [];
    isOpen = false
    myFormActivity!: FormGroup;
    public formErrorMessage: string = '';
    selectedActivity!: Job;
    isEditMode: boolean = false;
    editingId?: number;
    selectedDeleteId?: number;
    ngOnDestroy(): void {
      this.isOpen = false
    }

    constructor(
      private jobService: JobService,
      private router: Router,
      private pagination: PaginationService,
      private fb: FormBuilder
    ) {
      this.breadCrumbItems = [
        { label: 'Entreprise/Activités' },
        { label: 'Postes de travail', active: true }
      ];

    }


    ngOnInit(): void {
      this.loadActivities();
      this.myFormActivity = this.fb.group({
        ActivityName: ['', Validators.required]
      });

    }
    openAddModal(): void {
      this.myFormActivity.reset();
      this.isEditMode = false;
      this.editingId = undefined;
      this.formErrorMessage = '';

      const modalEl = document.getElementById('add_activity');
      if (modalEl) {
        const modalInstance = new bootstrap.Modal(modalEl);
        modalInstance.show();
      }
    }
    loadActivities(): void {
      this.jobService.getAllJobs().subscribe((activities: Job[]) => {
        console.log('Activities received from API:', activities);
        this.actualData = activities;
        this.totalData = activities.length;
        this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
          if (this.router.url == this.routes.jobs) {
            this.getTableData({ skip: res.skip, limit: res.limit });
            this.pageSize = res.pageSize;
          }
        });
      });
    }
    private getTableData(pageOption: pageSelection): void {
      this.jobService.getAllJobs().subscribe((activities: Job[]) => {
        this.tableData = [];
        this.tableDataCopy = [];
        this.serialNumberArray = [];
        this.actualData.forEach((activity: Job, index: number) => {
          const serialNumber = index + 1;
          if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
            (activity as any).sNo = serialNumber; // Ajouter le numéro de série
            this.tableData.push(activity);
            this.tableDataCopy.push(activity);
            this.serialNumberArray.push(serialNumber);
          }
        });
        this.dataSource = new MatTableDataSource<Job>(this.actualData);
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
      if (this.myFormActivity.valid) {
        const payload: Job = {
          job_title: this.myFormActivity.value.ActivityName
        };
        if (this.isEditMode && this.editingId) {
          // UPDATE
          this.jobService.updateJob(this.editingId, payload).subscribe({
            next: (updated) => {
              const index = this.tableData.findIndex(a => a.id === this.editingId);
              if (index !== -1) {
                this.tableData[index] = updated;
                this.dataSource.data = [...this.tableData];
              }
              this.resetFormAndCloseModal();
            }
          });
        }
        else{
        this.jobService.addJob(payload).subscribe({
          next: (newActivity) => {
            // Ajouter l'élément en haut du tableau
            this.actualData.unshift(newActivity);
            this.tableData.unshift(newActivity);

            // Mettre à jour le datasource
            this.dataSource.data = this.tableData;

            // Mettre à jour les numéros de série
            this.serialNumberArray = this.tableData.map((_, i) => i + 1);

            // Incrémenter total
            this.totalData++;
            this.resetFormAndCloseModal();
          },

          error: (err) => {
            if (err.status === 401) {
              this.formErrorMessage = 'Cette activité existe déjà';
            } else if (err.status === 422) {
              this.formErrorMessage = 'Erreur de validation : champ requis';
            } else {
              this.formErrorMessage = 'Erreur serveur, veuillez réessayer';
            }
          }
        });
      }
      } else {
        this.myFormActivity.markAllAsTouched(); // Trigger validation messages
      }
    }
    private resetFormAndCloseModal(): void {
    this.myFormActivity.reset();
    this.isEditMode = false;
    this.editingId = undefined;
    this.formErrorMessage = '';

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
      this.jobService.getJobById(id).subscribe({
        next: (job) => {
          this.myFormActivity.patchValue({
            ActivityName: job.job_title
          });

          this.isEditMode = true;
          this.editingId = job.id;

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

      this.jobService.deleteJob(this.selectedDeleteId).subscribe({
        next: () => {
          // Supprimer de la liste
          this.tableData = this.tableData.filter(activity => activity.id !== this.selectedDeleteId);
          this.actualData = this.actualData.filter(activity => activity.id !== this.selectedDeleteId);

          // Recalcul numéros de série
          this.serialNumberArray = this.tableData.map((_, i) => i + 1);
          this.dataSource.data = [...this.tableData];
          this.totalData--;

          this.selectedDeleteId = undefined;
        },
        error: (err) => {
          if (err.status === 404) {
            alert("❌ Impossible de supprimer : l’activité est liée à un utilisateur.");
          } else {
            alert("⚠️ Une erreur est survenue.");
          }
        }
      });
    }
}
