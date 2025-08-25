import { Component, OnInit, OnDestroy } from '@angular/core';
import { Role } from '../../../shared/data/role';
import { User } from '../../../models/user';
import { CompanyService } from '../../../services/company.service';
import { JobService } from '../../../services/job.service';
import { ActivityService } from '../../../services/activity.service';
import { Company } from '../../../models/company';
import { Job } from '../../../models/job';
import { Activity } from '../../../models/activity';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { UserService } from '../../../services/user/user.service';
import { MatTableDataSource } from '@angular/material/table';
import { PaginationService, tablePageSize } from '../../../shared/custom-pagination/pagination.service';
import { breadCrumbItems, pageSelection } from '../../../shared/models/models';
import { routes } from '../../../shared/routes/routes';
import { Sort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';
import { LoginService } from '../../../services/user/login.service';


declare var bootstrap: any;
@Component({
  selector: 'app-user',
  standalone: false,
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit, OnDestroy {
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
  createUserForm!: FormGroup;
  formErrorMessage: string = '';
  emailRegex = /^[a-zA-Z0-9]+(?:[a-zA-Z0-9._-]*[a-zA-Z0-9]+)?@[^\s@]+\.[a-zA-Z]{2,4}$/;
  fileErrors: { [key: string]: string } = {
    bank_details: '',
    vital_card: ''
  };
  isEditMode: boolean = false;
  editingId?: number;
  companies: Company[] = [];
  jobs: Job[] = [];
  activities: Activity[] = [];
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  onlyAllowedCountries: CountryISO[] = [CountryISO.France, CountryISO.Germany];
  private tablePageSizeSubscription?: Subscription;
  currentBankDetailsUrl: string | null = null;
  currentVitalCardUrl: string | null = null;
  selectedDeleteId?: number;
  activityId?: number;
  activityName?: string;
  isReadOnly = false;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private pagination: PaginationService,
    private router: Router,
    private fb: FormBuilder,
    private companyService: CompanyService,
    private jobService: JobService,
    private activityService: ActivityService,
    private loginService: LoginService
  ) {
    this.breadCrumbItems = [
      { label: 'RH' },
      { label: 'Utilisateurs', active: true }
    ];
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: Data) => {
      this.role = data['role'];
      this.route.queryParams.subscribe(params => {
        this.activityId = params['activity'];
        this.activityName = params['activityName'];

        if (this.activityId) {
          this.loadTechniciansByActivity(this.activityId);

        } else {
          this.loadUsers();
        }
      });
      //user superviseur authentifié
      this.getUserAuthentified();
      //initiation de formulaire
      this.createUserForm = this.fb.group({
        last_name: ['', [Validators.required,]],
        first_name: ['', [Validators.required,]],
        email: ['', [Validators.required, Validators.pattern(this.emailRegex)]],
        phone: [undefined, [Validators.required]],
        address: ['', [Validators.required,]],
        postal_address: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
        entry_date: ['', [Validators.required]],
        matricule: [''],
        company_id: [null],
        job_id: [null],
        activity_id: [null],
        bank_details: [null],
        vital_card: [null],
      });


      if (this.role === 'technicien') {
        this.createUserForm.get('matricule')?.setValidators([
          Validators.required,
          Validators.pattern(/^\d{3}$/)
        ]);
        this.createUserForm.get('company_id')?.setValidators(Validators.required);
        this.createUserForm.get('job_id')?.setValidators(Validators.required);
        this.createUserForm.get('activity_id')?.setValidators(Validators.required);
      } else if (this.role === 'superviseur') {
        this.createUserForm.get('company_id')?.setValidators(Validators.required);
      }

      // Mettre à jour après modification des validators
      this.createUserForm.get('matricule')?.updateValueAndValidity();
      this.createUserForm.get('company_id')?.updateValueAndValidity();
      this.createUserForm.get('job_id')?.updateValueAndValidity();
      this.createUserForm.get('activity_id')?.updateValueAndValidity();
    });
    this.getAllActivities();
    this.getAllCompanies();
    this.getAllJobs();
  }
  ngOnDestroy(): void {
    // Nettoyez la souscription pour éviter des fuites
    if (this.tablePageSizeSubscription) {
      this.tablePageSizeSubscription.unsubscribe();
    }
  }
  openAddModal(): void {
    this.createUserForm.reset();
    this.isEditMode = false;
    this.editingId = undefined;
    const modalEl = document.getElementById('add_employee');
    if (modalEl) new bootstrap.Modal(modalEl).show();

  }
  private resetFormAndCloseModal(): void {
    this.createUserForm.reset();
    this.isEditMode = false;
    this.editingId = undefined;

    const modalEl = document.getElementById('add_employee');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();
    }
  }
  onFileChange(event: Event, controlName: 'bank_details' | 'vital_card'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.fileErrors[controlName] = '';
      this.createUserForm.get(controlName)?.setValue(null);
      return;
    }

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      this.fileErrors[controlName] = 'Format invalide. Seuls JPG, PNG ou PDF sont autorisés.';
      this.createUserForm.get(controlName)?.setValue(null);
      return;
    }

    if (file.size > maxSize) {
      this.fileErrors[controlName] = 'Le fichier ne doit pas dépasser 2 Mo.';
      this.createUserForm.get(controlName)?.setValue(null);
      return;
    }

    this.fileErrors[controlName] = '';
    this.createUserForm.get(controlName)?.setValue(file);
  }

  onDownloadUsers() {
  this.loading = true;
  this.userService.getExportUsers(this.role).subscribe({
    next: (res) => {
      const blob = res.body as Blob;
      let filename = 'users.xlsx';
      const cd = res.headers.get('Content-Disposition');
      const match = cd?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
      if (match?.[1]) filename = match[1].replace(/['"]/g, '');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      this.loading = false;
    },
    error: (err) => {
      this.loading = false;

  if (err.error instanceof Blob) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const json = JSON.parse(text);
        console.error('Erreur export (serveur):', json);
      } catch {
        console.error('Erreur export (texte):', reader.result);
      }
    };
    reader.readAsText(err.error);
  } else {
    console.error('Erreur export', err);
  }
    }
  });
}
  private loadUsers(): void {
    this.loading = true;
    this.userService.getUsersByRoles(this.role).subscribe((users: User[]) => {
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
  loadUserById(id: number): void {
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.createUserForm.patchValue({
          last_name: user.last_name,
          first_name: user.first_name,
          email: user.email,
          matricule: user.matricule,
          phone: user.phone,
          address: user.address,
          postal_address: user.postal_address,
          entry_date: user.entry_date,
          company_id: user.company_id,
          job_id: user.job_id,
          activity_id: user.activity_id,
        });

        // Mettre à jour les URLs des documents
        this.currentBankDetailsUrl = typeof user.bank_details === 'string' ? user.bank_details : null;
        this.currentVitalCardUrl = typeof user.vital_card === 'string' ? user.vital_card : null;
        this.isEditMode = true;
        this.editingId = user.id;

        const modalEl = document.getElementById('add_employee');
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

  private getAllCompanies(): void {
    this.companyService.getAllCompany().subscribe((companies: Company[]) => {
      this.companies = companies;

    });
  }
  private getAllJobs(): void {
    this.jobService.getAllJobs().subscribe((jobs: Job[]) => {
      this.jobs = jobs;

    });
  }
  private getAllActivities(): void {
    this.activityService.getAllActivity().subscribe((activities: Activity[]) => {
      this.activities = activities;

    });
  }

  onSubmit(): void {
    if (this.createUserForm.invalid) {
      this.createUserForm.markAllAsTouched();
      return;
    }
    const fv = this.createUserForm.value;
    const userData: User = {
      ...fv,
      phone: fv.phone?.e164Number || '',
      // Si les fichiers sont des objets File, les envoyer directement
      // Sinon, ils sont probablement des strings (URLs des fichiers existants)
      bank_details: fv.bank_details,
      vital_card: fv.vital_card
    };

    if (this.isEditMode && this.editingId) {

      this.userService.updateUser(this.editingId, userData).subscribe({
        next: updated => {

          const idx = this.actualData.findIndex(u => u.id === this.editingId);
          if (idx > -1) {
            this.actualData[idx] = updated;
            this.getTableData({ skip: this.skip, limit: this.limit });
          }
          this.resetFormAndCloseModal();
        },
        error: err => console.error('Erreur update', err)
      });
    } else {
      // CRÉATION
      this.userService.createUser(userData, this.role).subscribe({
        next: created => {
          this.actualData.unshift(created);
          this.getTableData({ skip: this.skip, limit: this.limit });
          this.totalData++;
          this.resetFormAndCloseModal();
        },
        error: err => console.error('Erreur create', err)
      });
    }
  }
  confirmDelete(id: number): void {
    this.selectedDeleteId = id;

    const modalEl = document.getElementById('delete_modal_user');
    if (modalEl) {
      const modalInstance = new bootstrap.Modal(modalEl);
      modalInstance.show();
    }
  }
  deleteSelectedUser(): void {
    if (!this.selectedDeleteId) return;

    this.userService.deleteUser(this.selectedDeleteId).subscribe({
      next: () => {
        // Supprimer de la liste
        this.tableData = this.tableData.filter(user => user.id !== this.selectedDeleteId);
        this.actualData = this.actualData.filter(user => user.id !== this.selectedDeleteId);

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

  loadTechniciansByActivity(activityId: number): void {
    this.userService.getUsersByActivity(Role.Techniciens, activityId).subscribe(users => {
      this.users = users;
      this.tableData = users;
    });
  }
  getUserAuthentified() {
    this.loginService.user$.subscribe(user => {
      // Si route cible "superviseurs" ET user connecté est superviseur
      if (this.role === 'superviseur' && user?.role === 'superviseur') {
        this.isReadOnly = true;
      } else {
        this.isReadOnly = false;
      }
    });
  }
}
