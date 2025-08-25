import { Component, OnInit } from '@angular/core';
import { VehicleModel } from '../../../models/vehicleModel';
import { breadCrumbItems, pageSelection } from '../../../shared/models/models';
import { MatTableDataSource } from '@angular/material/table';
import { routes } from '../../../shared/routes/routes';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { VehicleModelService } from '../../../services/vehicleModel/vehicle-model.service';
import { PaginationService, tablePageSize } from '../../../shared/custom-pagination/pagination.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { VehicleBrandService } from '../../../services/vehicleBrand/vehicle-brand.service';
import { VehicleBrand } from '../../../models/vehicleBrand';
declare var bootstrap: any;
@Component({
  selector: 'app-vehicle-models',
  standalone: false,
  templateUrl: './vehicle-models.component.html',
  styleUrl: './vehicle-models.component.scss',
})
export class VehicleModelsComponent implements OnInit {
  public routes = routes;
  initChecked = false;
  loading = false;
  private tablePageSizeSubscription?: Subscription;
  // pagination variables
  public pageSize = 10;
  public tableData: VehicleModel[] = [];
  public tableDataCopy: VehicleModel[] = [];
  public vehicle_models: VehicleModel[] = [];
  public vehicle_brands: VehicleBrand[] = [];
  public actualData: VehicleModel[] = [];
  public currentPage = 1;
  public skip = 0;
  public limit: number = this.pageSize;
  public serialNumberArray: number[] = [];
  public totalData = 0;
  selectedDeleteId?: number;
  showFilter = false;
  public pageSelection: pageSelection[] = [];
  dataSource!: MatTableDataSource<VehicleModel>;
  public searchDataValue = '';
  breadCrumbItems: breadCrumbItems[] = [];
  isEditMode: boolean = false;
  editingId?: number;
  myFormModel!: FormGroup;
  public formErrorMessage: string = '';
  isOpen = false;
  constructor(
    private vehicleModelService: VehicleModelService,
    private pagination: PaginationService,
    private fb: FormBuilder,
    private vehicleBrandService: VehicleBrandService,
    private messageService: MessageService
  ) {
    this.breadCrumbItems = [
      { label: 'Véhicules' },
      { label: 'Modéles', active: true },
    ];
  }
  ngOnInit(): void {
    this.loadVehicleModels();
    this.loadVehicleBrands();
    this.myFormModel = this.fb.group({
      modelName: ['', Validators.required],
      brand_id: ['', Validators.required],
    });
  }

  ngOnDestroy(): void {
    // Nettoyez la souscription pour éviter des fuites
    if (this.tablePageSizeSubscription) {
      this.tablePageSizeSubscription.unsubscribe();
      this.isOpen = false;
    }
  }
  openAddModal(): void {
    this.myFormModel.reset();
    this.isEditMode = false;
    this.editingId = undefined;
    this.formErrorMessage = '';

    const modalEl = document.getElementById('add_model');
    if (modalEl) {
      const modalInstance = new bootstrap.Modal(modalEl);
      modalInstance.show();
    }
  }

  private resetFormAndCloseModal(): void {
    this.myFormModel.reset();
    this.isEditMode = false;
    this.editingId = undefined;
    this.formErrorMessage = '';

    const modalEl = document.getElementById('add_model');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();
    }
  }
  private loadVehicleBrands(): void {
    this.vehicleBrandService.getVehicleBrands().subscribe({
      next: (vehicle_brands: VehicleBrand[]) => {
        this.vehicle_brands = vehicle_brands;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des marques :', err);
      },
    });
  }
  private loadVehicleModels(): void {
    this.loading = true;
    this.vehicleModelService
      .getVehicleModels()
      .subscribe((vehicle_models: VehicleModel[]) => {
        this.actualData = vehicle_models;
        this.totalData = vehicle_models.length;
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
    this.actualData.forEach((vehicle_brand: VehicleModel, index: number) => {
      const serialNumber = index + 1;
      if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
        (vehicle_brand as any).sNo = serialNumber;
        this.tableData.push(vehicle_brand);
      }
    });

    // Met à jour le dataSource sans le recréer
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource<VehicleModel>(this.tableData);
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

  trackById(index: number, item: VehicleModel): number {
    return item.id ?? index;
  }

  loadModelById(id: number): void {
    this.vehicleModelService.getVehicleModelById(id).subscribe({
      next: (model) => {
        this.myFormModel.patchValue({
          modelName: model.model_name,
          brand_id: model.brand_id
        });
        console.log(model);
        this.isEditMode = true;
        this.editingId = model.id;
        const modalEl = document.getElementById('add_model');
        if (modalEl) {
          const modalInstance = new bootstrap.Modal(modalEl);
          modalInstance.show();
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement :', err);
      },
    });
  }
  onSubmit(): void {
    if (this.myFormModel.valid) {
      const formData = {
            model_name: this.myFormModel.value.modelName,
            brand_id: this.myFormModel.value.brand_id
          };
                if (this.isEditMode && this.editingId) {
        // UPDATE
        this.vehicleModelService
          .updateVehicleModel(this.editingId, formData)
          .subscribe({
            next: (updated) => {
              const index = this.tableData.findIndex(
                (a) => a.id === this.editingId
              );
              if (index !== -1) {
                this.tableData[index] = updated;
                this.dataSource.data = [...this.tableData];
              }
              this.messageService.add({
                summary: 'Succès',
                detail: 'Modèle modifié avec succès ✅',
                severity: 'success',
                styleClass: 'success-light-popover',
              });
              this.resetFormAndCloseModal();
            },
            error: (err) => {
              this.resetFormAndCloseModal();
              if (err.status === 422) {
                this.resetFormAndCloseModal();
                if (err.error?.errors?.model_name?.[0]) {
                  this.formErrorMessage = err.error.errors.model_name[0];
                } else {
                  this.formErrorMessage = 'Erreur serveur, veuillez réessayer';
                }
                setTimeout(() => (this.formErrorMessage = ''), 6000);
              }
            },
          });
      } else {
        this.vehicleModelService.addVehicleModel(formData).subscribe({
          next: (newModel) => {
            // Ajouter l'élément en haut du tableau
            this.actualData.unshift(newModel);
            this.tableData.unshift(newModel);

            // Mettre à jour le datasource
            this.dataSource.data = this.tableData;

            // Mettre à jour les numéros de série
            this.serialNumberArray = this.tableData.map((_, i) => i + 1);

            // Incrémenter total
            this.totalData++;
            this.messageService.add({
              summary: 'Succès',
              detail: 'Modèle ajoutée avec succès ✅',
              severity: 'success',
              styleClass: 'success-light-popover',
            });
            this.resetFormAndCloseModal();
          },

          error: (err) => {
            this.resetFormAndCloseModal();
            if (err.status === 422) {
              if (err.error?.errors?.model_name?.[0]) {
                this.formErrorMessage = err.error.errors.model_name[0];
              } else {
                this.formErrorMessage = 'Erreur serveur, veuillez réessayer';
              }
              setTimeout(() => (this.formErrorMessage = ''), 6000);
            }
          },
        });
      }
    } else {
      this.myFormModel.markAllAsTouched(); // Trigger validation messages
    }
  }

  confirmDelete(id: number): void {
    this.selectedDeleteId = id;

    const modalEl = document.getElementById('delete_modal_model');
    if (modalEl) {
      const modalInstance = new bootstrap.Modal(modalEl);
      modalInstance.show();
    }
  }
  deleteSelectedModel(): void {
    if (!this.selectedDeleteId) return;

    this.vehicleModelService
      .deleteVehicleModel(this.selectedDeleteId)
      .subscribe({
        next: () => {
          // Supprimer de la liste
          this.tableData = this.tableData.filter(
            (activity) => activity.id !== this.selectedDeleteId
          );
          this.actualData = this.actualData.filter(
            (activity) => activity.id !== this.selectedDeleteId
          );

          this.serialNumberArray = this.tableData.map((_, i) => i + 1);
          this.dataSource.data = [...this.tableData];
          this.totalData--;

          this.selectedDeleteId = undefined;
          this.messageService.add({
            summary: 'Succès',
            detail: 'Marque supprimé avec succès ✅',
            severity: 'success',
            styleClass: 'success-light-popover',
          });
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
