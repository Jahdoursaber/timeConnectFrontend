import { Component, OnInit } from '@angular/core';
import { VehicleBrand } from '../../../models/vehicleBrand';
import { breadCrumbItems, pageSelection } from '../../../shared/models/models';
import { MatTableDataSource } from '@angular/material/table';
import { routes } from '../../../shared/routes/routes';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { VehicleBrandService } from '../../../services/vehicleBrand/vehicle-brand.service';
import { PaginationService, tablePageSize } from '../../../shared/custom-pagination/pagination.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
declare var bootstrap: any;
@Component({
  selector: 'app-vehicle-brands',
  standalone: false,
  templateUrl: './vehicle-brands.component.html',
  styleUrl: './vehicle-brands.component.scss',
})
export class VehicleBrandsComponent implements OnInit {
  public routes = routes;
  initChecked = false;
  loading = false;
  private tablePageSizeSubscription?: Subscription;
  // pagination variables
  public pageSize = 10;
  public tableData: VehicleBrand[] = [];
  public tableDataCopy: VehicleBrand[] = [];
  public vehicle_brands: VehicleBrand[] = [];
  public actualData: VehicleBrand[] = [];
  public currentPage = 1;
  public skip = 0;
  public limit: number = this.pageSize;
  public serialNumberArray: number[] = [];
  public totalData = 0;
  selectedDeleteId?: number;
  showFilter = false;
  public pageSelection: pageSelection[] = [];
  dataSource!: MatTableDataSource<VehicleBrand>;
  public searchDataValue = '';
  breadCrumbItems: breadCrumbItems[] = [];
  isEditMode: boolean = false;
  editingId?: number;
  myFormBrand!: FormGroup;
  public formErrorMessage: string = '';
  isOpen = false
  constructor(
    private vehicleBrandService: VehicleBrandService,
    private pagination: PaginationService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private messageService: MessageService
  ) {
    this.breadCrumbItems = [
      { label: 'Véhicules' },
      { label: 'Marques', active: true },
    ];
  }
  ngOnInit(): void {
    this.loadVehicleBrands();
    this.myFormBrand = this.fb.group({
        brandName: ['', Validators.required]
      });
  }
  ngOnDestroy(): void {
    // Nettoyez la souscription pour éviter des fuites
    if (this.tablePageSizeSubscription) {
      this.tablePageSizeSubscription.unsubscribe();
      this.isOpen = false
    }
  }
  openAddModal(): void {
      this.myFormBrand.reset();
      this.isEditMode = false;
      this.editingId = undefined;
      this.formErrorMessage = '';

      const modalEl = document.getElementById('add_brand');
      if (modalEl) {
        const modalInstance = new bootstrap.Modal(modalEl);
        modalInstance.show();
      }
    }
  private resetFormAndCloseModal(): void {
    this.myFormBrand.reset();
    this.isEditMode = false;
    this.editingId = undefined;
    this.formErrorMessage = '';

    const modalEl = document.getElementById('add_brand');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();
    }
  }
  private loadVehicleBrands(): void {
    this.loading = true;
    this.vehicleBrandService.getVehicleBrands()
      .subscribe((vehicle_brands: VehicleBrand[]) => {
        this.actualData = vehicle_brands;
        this.totalData = vehicle_brands.length;
        this.tableDataCopy = [...this.actualData];
        if (this.tablePageSizeSubscription) {
          this.tablePageSizeSubscription.unsubscribe();
        }
        this.tablePageSizeSubscription =
          this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
            this.getTableData({ skip: res.skip, limit: res.limit });
            this.pageSize = res.pageSize;
          });
        this.loading = false;
      });
  }

  private getTableData(pageOption: pageSelection): void {
    this.tableData = [];
    this.serialNumberArray = [];
    this.actualData.forEach((vehicle_brand: VehicleBrand, index: number) => {
      const serialNumber = index + 1;
      if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
        (vehicle_brand as any).sNo = serialNumber;
        this.tableData.push(vehicle_brand);
      }
    });

    // Met à jour le dataSource sans le recréer
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource<VehicleBrand>(this.tableData);
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

  trackById(index: number, item: VehicleBrand): number {
    return item.id ?? index;
  }
  loadBrandById(id: number): void {
      this.vehicleBrandService.getVehicleBrandById(id).subscribe({
        next: (brand) => {
          this.myFormBrand.patchValue({
            brandName: brand.brand_name
          });

          this.isEditMode = true;
          this.editingId = brand.id;
          console.log(brand.brand_name);
          const modalEl = document.getElementById('add_brand');
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
        if (this.myFormBrand.valid) {
          const payload: VehicleBrand = {
            brand_name : this.myFormBrand.value.brandName
          };
          if (this.isEditMode && this.editingId) {
            // UPDATE
            this.vehicleBrandService.updateVehicleBrand(this.editingId, payload).subscribe({
              next: (updated) => {
                const index = this.tableData.findIndex(a => a.id === this.editingId);
                if (index !== -1) {
                  this.tableData[index] = updated;
                  this.dataSource.data = [...this.tableData];
                }
                this.messageService.add({
                summary: 'Succès',
                detail: 'Demande mise à jour avec succès ✅',
                severity: 'success',
                styleClass: 'success-light-popover'
              });
                this.resetFormAndCloseModal();
              },
              error: (err) => {
            this.resetFormAndCloseModal();
            if (err.status === 422) {
              this.resetFormAndCloseModal();
                if (err.error?.errors?.brand_name?.[0]) {
                  this.formErrorMessage = err.error.errors.brand_name[0];
                } else {
                  this.formErrorMessage = 'Erreur serveur, veuillez réessayer';
                }
                setTimeout(() => this.formErrorMessage = '', 6000);
              }
          }
            });
          }
          else{
          this.vehicleBrandService.addVehicleBrand(payload).subscribe({
            next: (newBrand) => {
              // Ajouter l'élément en haut du tableau
              this.actualData.unshift(newBrand);
              this.tableData.unshift(newBrand);

              // Mettre à jour le datasource
              this.dataSource.data = this.tableData;

              // Mettre à jour les numéros de série
              this.serialNumberArray = this.tableData.map((_, i) => i + 1);

              // Incrémenter total
              this.totalData++;
               this.messageService.add({
                summary: 'Succès',
                detail: 'Marque ajoutée avec succès ✅',
                severity: 'success',
                styleClass: 'success-light-popover'
              });
              this.resetFormAndCloseModal();
            },

            error: (err) => {
              this.resetFormAndCloseModal();
              if (err.status === 422) {
                if (err.error?.errors?.brand_name?.[0]) {
                  this.formErrorMessage = err.error.errors.brand_name[0];
                } else {
                  this.formErrorMessage = 'Erreur serveur, veuillez réessayer';
                }
                setTimeout(() => this.formErrorMessage = '', 6000);
              }
            }
          });
        }
        } else {
          this.myFormBrand.markAllAsTouched(); // Trigger validation messages
        }
      }

    confirmDelete(id: number): void {
      this.selectedDeleteId = id;

      const modalEl = document.getElementById('delete_modal_brand');
      if (modalEl) {
        const modalInstance = new bootstrap.Modal(modalEl);
        modalInstance.show();
      }
    }
    deleteSelectedBrand(): void {
      if (!this.selectedDeleteId) return;

      this.vehicleBrandService.deleteVehicleBrand(this.selectedDeleteId).subscribe({
        next: () => {
          // Supprimer de la liste
          this.tableData = this.tableData.filter(vehicle_model => vehicle_model.id !== this.selectedDeleteId);
          this.actualData = this.actualData.filter(vehicle_model => vehicle_model.id !== this.selectedDeleteId);

          this.serialNumberArray = this.tableData.map((_, i) => i + 1);
          this.dataSource.data = [...this.tableData];
          this.totalData--;

          this.selectedDeleteId = undefined;
          this.messageService.add({
                summary: 'Succès',
                detail: 'Modèle supprimé avec succès ✅',
                severity: 'success',
                styleClass: 'success-light-popover'
              });
        },
        error: (err) => {
          console.log(err);
        }
      });
    }
}
