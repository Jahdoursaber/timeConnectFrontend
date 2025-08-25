import { Component,OnInit } from '@angular/core';
import { VehicleType } from '../../../models/vehicleType';
import { breadCrumbItems, pageSelection } from '../../../shared/models/models';
import { MatTableDataSource } from '@angular/material/table';
import { routes } from '../../../shared/routes/routes';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { PaginationService, tablePageSize } from '../../../shared/custom-pagination/pagination.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { VehicleTypeService } from '../../../services/vehicleType/vehicle-type.service';
declare var bootstrap: any;
@Component({
  selector: 'app-vehicle-types',
  standalone: false,
  templateUrl: './vehicle-types.component.html',
  styleUrl: './vehicle-types.component.scss'
})
export class VehicleTypesComponent implements OnInit{

  public routes = routes;
    initChecked = false;
    loading = false;
    private tablePageSizeSubscription?: Subscription;
    // pagination variables
    public pageSize = 10;
    public tableData: VehicleType[] = [];
    public tableDataCopy: VehicleType[] = [];
    public vehicle_types: VehicleType[] = [];
    public actualData: VehicleType[] = [];
    public currentPage = 1;
    public skip = 0;
    public limit: number = this.pageSize;
    public serialNumberArray: number[] = [];
    public totalData = 0;
    selectedDeleteId?: number;
    showFilter = false;
    public pageSelection: pageSelection[] = [];
    dataSource!: MatTableDataSource<VehicleType>;
    public searchDataValue = '';
    breadCrumbItems: breadCrumbItems[] = [];
    isEditMode: boolean = false;
    editingId?: number;
    myFormType!: FormGroup;
    public formErrorMessage: string = '';
    isOpen = false

    constructor(
    private vehicleTypeService: VehicleTypeService,
    private pagination: PaginationService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private messageService: MessageService
  ) {
    this.breadCrumbItems = [
      { label: 'Véhicules' },
      { label: 'Types de véhicule', active: true },
    ];
  }
  ngOnInit(): void {
    this.loadVehicleTypes();
    this.myFormType = this.fb.group({
        typeName: ['', Validators.required]
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
      this.myFormType.reset();
      this.isEditMode = false;
      this.editingId = undefined;
      this.formErrorMessage = '';

      const modalEl = document.getElementById('add_type');
      if (modalEl) {
        const modalInstance = new bootstrap.Modal(modalEl);
        modalInstance.show();
      }
    }
  private resetFormAndCloseModal(): void {
    this.myFormType.reset();
    this.isEditMode = false;
    this.editingId = undefined;
    this.formErrorMessage = '';

    const modalEl = document.getElementById('add_type');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();
    }
  }
  private loadVehicleTypes(): void {
      this.loading = true;
      this.vehicleTypeService.getVehicleTypes()
        .subscribe((vehicle_types: VehicleType[]) => {
          this.actualData = vehicle_types;
          this.totalData = vehicle_types.length;
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
      this.actualData.forEach((vehicle_type: VehicleType, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          (vehicle_type as any).sNo = serialNumber;
          this.tableData.push(vehicle_type);
        }
      });

      // Met à jour le dataSource sans le recréer
      if (!this.dataSource) {
        this.dataSource = new MatTableDataSource<VehicleType>(this.tableData);
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

    trackById(index: number, item: VehicleType): number {
      return item.id ?? index;
    }

    loadTypeById(id: number): void {
      this.vehicleTypeService.getVehicleTypeById(id).subscribe({
        next: (type) => {
          this.myFormType.patchValue({
            typeName: type.type_name
          });

          this.isEditMode = true;
          this.editingId = type.id;

          const modalEl = document.getElementById('add_type');
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
          if (this.myFormType.valid) {
            const payload: VehicleType = {
              type_name : this.myFormType.value.typeName
            };
            if (this.isEditMode && this.editingId) {
              // UPDATE
              this.vehicleTypeService.updateVehicleType(this.editingId, payload).subscribe({
                next: (updated) => {
                  const index = this.tableData.findIndex(a => a.id === this.editingId);
                  if (index !== -1) {
                    this.tableData[index] = updated;
                    this.dataSource.data = [...this.tableData];
                  }
                  this.messageService.add({
                  summary: 'Succès',
                  detail: 'Type de véhicule mise à jour avec succès ✅',
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
            this.vehicleTypeService.addVehicleType(payload).subscribe({
              next: (newType) => {
                // Ajouter l'élément en haut du tableau
                this.actualData.unshift(newType);
                this.tableData.unshift(newType);

                // Mettre à jour le datasource
                this.dataSource.data = this.tableData;

                // Mettre à jour les numéros de série
                this.serialNumberArray = this.tableData.map((_, i) => i + 1);

                // Incrémenter total
                this.totalData++;
                 this.messageService.add({
                  summary: 'Succès',
                  detail: 'Type de véhicule ajoutée avec succès ✅',
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
            this.myFormType.markAllAsTouched(); // Trigger validation messages
          }
        }

      confirmDelete(id: number): void {
        this.selectedDeleteId = id;

        const modalEl = document.getElementById('delete_modal_type');
        if (modalEl) {
          const modalInstance = new bootstrap.Modal(modalEl);
          modalInstance.show();
        }
      }
      deleteSelectedType(): void {
        if (!this.selectedDeleteId) return;

        this.vehicleTypeService.deleteVehicleType(this.selectedDeleteId).subscribe({
          next: () => {
            // Supprimer de la liste
            this.tableData = this.tableData.filter(activity => activity.id !== this.selectedDeleteId);
            this.actualData = this.actualData.filter(activity => activity.id !== this.selectedDeleteId);

            this.serialNumberArray = this.tableData.map((_, i) => i + 1);
            this.dataSource.data = [...this.tableData];
            this.totalData--;

            this.selectedDeleteId = undefined;
            this.messageService.add({
                  summary: 'Succès',
                  detail: 'Type de véhicule supprimé avec succès ✅',
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
