import { Component, OnInit } from '@angular/core';
import { breadCrumbItems, pageSelection } from '../../../shared/models/models';
import { CompanyService } from '../../../services/company.service';
import { Company } from '../../../models/company';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CollectiveAgreementsService } from '../../../services/collective-agreements.service';
import { ApeService } from '../../../services/ape.service';
import { CollectiveAgreement } from '../../../models/collectiveAgreements';
import { Ape } from '../../../models/ape';
import { MatTableDataSource } from '@angular/material/table';
import { PaginationService, tablePageSize } from '../../../shared/custom-pagination/pagination.service';
import { Router } from '@angular/router';
import { routes } from '../../../shared/routes/routes';
import { Sort } from '@angular/material/sort';

declare var bootstrap: any;
@Component({
  selector: 'app-company',
  standalone: false,
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss'
})
export class CompanyComponent implements OnInit {
  public routes = routes;
  pageSize = 10;
  tableData: Company[] = [];
  tableDataCopy: Company[] = [];
  companies: Company[] = [];
  public currentPage = 1;
  public skip = 0;
  public limit: number = this.pageSize;
  serialNumberArray: number[] = [];
  totalData = 0;
  showFilter = false;
  public pageSelection: pageSelection[] = [];
  dataSource!: MatTableDataSource<Company>;
  public searchDataValue = '';
  collectives: CollectiveAgreement[] = [];
  apes: Ape [] = [];
  breadCrumbItems: breadCrumbItems[] = [];
  myFormCompany!: FormGroup;
  actualData: Company[] = [];
  selectedCompany!: Company;
  isEditMode: boolean = false;
  editingId?: number;
  selectedDeleteId?: number;
  constructor(
    private companyService:CompanyService,
    private fb: FormBuilder,
    private collectiveService:CollectiveAgreementsService,
    private apeService:ApeService,
    private router: Router,
    private pagination: PaginationService,
   ) {
    this.breadCrumbItems = [
      { label: 'Entreprise/Activités' },
      { label: 'Entreprises', active: true }
    ];
  }
  ngOnInit(): void {
    this.getAllCompanies();
    this.getAllCollectiveAgreements();
    this.getAllApes();
    this.myFormCompany = this.fb.group({
        company_name: ['', Validators.required],
        address: ['', Validators.required],
        num_siret: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        collective_id: [null],
        ape_id: [null]
        });
  }
  openAddModal(): void {
    this.myFormCompany.reset();
    this.isEditMode = false;
    this.editingId = undefined;
    const modalEl = document.getElementById('add_companyid');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }
  onSubmit(): void {
    if (this.myFormCompany.valid) {
      const formData: Company = this.myFormCompany.value;
      if (this.isEditMode && this.editingId) {
        // UPDATE
        this.companyService.updateCompany(this.editingId, formData).subscribe({
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
      else {
        this.companyService.addCompany(formData).subscribe({
          next: (createdCompany) => {
            this.actualData.unshift(createdCompany);
            this.tableData.unshift(createdCompany);

          // Mettre à jour le datasource
          this.dataSource.data = this.tableData;

          // Mettre à jour les numéros de série
          this.serialNumberArray = this.tableData.map((_, i) => i + 1);

          // Incrémenter total
          this.totalData++;
          this.resetFormAndCloseModal();
            
          },
          error: (err) => {
            console.error('Erreur lors de l’ajout :', err);
          }
        });
      }

    } else {
      this.myFormCompany.markAllAsTouched();
    }
  }
  private resetFormAndCloseModal(): void {
    this.myFormCompany.reset();
    this.isEditMode = false;
    this.editingId = undefined;


    const modalEl = document.getElementById('add_companyid');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();
    }
  }
  private getAllCompanies(): void {
    this.companyService.getAllCompany().subscribe((companies:Company[]) => {
      this.actualData= companies;
      this.totalData = companies.length;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.companies) {
          this.getTableData({ skip: res.skip, limit: res.limit });
          this.pageSize = res.pageSize;
        }
      });
    });
  }
  private getTableData(pageOption: pageSelection): void {
      this.companyService.getAllCompany().subscribe((companies: Company[]) => {
        this.tableData = [];
        this.tableDataCopy = [];
        this.serialNumberArray = [];
        this.actualData.forEach((company: Company, index: number) => {
          const serialNumber = index + 1;
          if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
            (company as any).sNo = serialNumber; // Ajouter le numéro de série
            this.tableData.push(company);
            this.tableDataCopy.push(company);
            this.serialNumberArray.push(serialNumber);
          }
        });
        this.dataSource = new MatTableDataSource<Company>(this.actualData);
        this.pagination.calculatePageSize.next({
          totalData: this.totalData,
          pageSize: this.pageSize,
          tableData: this.tableData,
          tableDataCopy: this.tableDataCopy,
          serialNumberArray: this.serialNumberArray,

        });

      });
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
    trackById(index: number, item: Company): number {
      return item.id;
    }
    private getAllCollectiveAgreements(): void {
      this.collectiveService.getAllCollectiveAgreements().subscribe((collectives:CollectiveAgreement[]) => {
        this.collectives= collectives;

      });
    }

    private getAllApes(): void {
      this.apeService.getAllApes().subscribe((apes:Ape[]) => {
        this.apes= apes;

      });
    }

    loadCompanyById(id: number): void {
      this.companyService.getCompanyById(id).subscribe({
        next: (company) => {
          this.myFormCompany.patchValue({
            company_name: company.company_name,
            address: company.address,
            num_siret: company.num_siret,
            email: company.email,
            collective_id: company.collective_id,
            ape_id: company.ape_id,
          });

          this.isEditMode = true;
          this.editingId = company.id;

          const modalEl = document.getElementById('add_companyid');
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

      const modalEl = document.getElementById('delete_modal_company');
      if (modalEl) {
        const modalInstance = new bootstrap.Modal(modalEl);
        modalInstance.show();
      }
    }

    deleteSelectedCompany(): void {
      if (!this.selectedDeleteId) return;

      this.companyService.deleteCompany(this.selectedDeleteId).subscribe({
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
