import { Component, OnInit } from '@angular/core';
import { Vehicle } from '../../../models/vehicle';
import { breadCrumbItems, pageSelection } from '../../../shared/models/models';
import { MatTableDataSource } from '@angular/material/table';
import { routes } from '../../../shared/routes/routes';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { VehicleService } from '../../../services/vehicle/vehicle.service';
import {
  PaginationService,
  tablePageSize,
} from '../../../shared/custom-pagination/pagination.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { VehicleBrandService } from '../../../services/vehicleBrand/vehicle-brand.service';
import { VehicleBrand } from '../../../models/vehicleBrand';
import { VehicleModelService } from '../../../services/vehicleModel/vehicle-model.service';
import { VehicleTypeService } from '../../../services/vehicleType/vehicle-type.service';
import { VehicleType } from '../../../models/vehicleType';
import { VehicleModel } from '../../../models/vehicleModel';
import { VehicleFuelType } from '../../../models/vehicleFuelType';
import { UserService } from '../../../services/user/user.service';
import { User } from '../../../models/user';
import { VehicleAssigment } from '../../../models/vehicleAssigment';
declare var bootstrap: any;
@Component({
  selector: 'app-vehicles',
  standalone: false,
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss',
})
export class VehiclesComponent implements OnInit {
  public routes = routes;
  initChecked = false;
  loading = false;
  private tablePageSizeSubscription?: Subscription;
  // pagination variables
  public pageSize = 10;
  public tableData: Vehicle[] = [];
  public tableDataCopy: Vehicle[] = [];
  public vehicles: Vehicle[] = [];
  public vehicle_brands: VehicleBrand[] = [];
  public vehicle_models: VehicleModel[] = [];
  public vehicle_types: VehicleType[] = [];
  public fuel_types: VehicleFuelType[] = [];
  public actualData: Vehicle[] = [];
  public currentPage = 1;
  public skip = 0;
  public limit: number = this.pageSize;
  public serialNumberArray: number[] = [];
  public totalData = 0;
  selectedDeleteId?: number;
  showFilter = false;
  public pageSelection: pageSelection[] = [];
  dataSource!: MatTableDataSource<Vehicle>;
  public searchDataValue = '';
  breadCrumbItems: breadCrumbItems[] = [];
  isEditMode: boolean = false;
  editingId?: number;
  MyVehicleForm!: FormGroup;
  MyassignForm!: FormGroup;
  selectedAssignVehicleId?: number;
  selectedVehicleRestitueId?: number;
  public formErrorMessage: string = '';
  technicians: User[] = [];
  assignmentInfo: VehicleAssigment | null = null;
  isOpen = false;
  fileErrors: { [key: string]: string } = {
    gray_card: '',
    green_card: '',
  };
  currentGrayCardsUrl: string | null = null;
  currentGreenCardUrl: string | null = null;
  constructor(
    private vehicleService: VehicleService,
    private pagination: PaginationService,
    private fb: FormBuilder,
    private vehicleBrandService: VehicleBrandService,
    private vehicleModelService: VehicleModelService,
    private vehicleTypeService: VehicleTypeService,
    private userService: UserService,
    private messageService: MessageService
  ) {
    this.breadCrumbItems = [
      { label: 'Véhicules' },
      { label: 'véhicules', active: true },
    ];
  }

  ngOnInit(): void {
    //this.loadVehicleModels();
    this.loadVehicles();
    this.loadUnssignedVehicleTechnicians();
    this.MyassignForm = this.fb.group({
      technicien_id: ['', Validators.required],
      date_affectation: [null, Validators.required],
    });
    this.MyVehicleForm = this.fb.group({
      vehicle_type_id: ['', Validators.required],
      brand_id: ['', Validators.required],
      model_id: ['', Validators.required],
      plaque_immatriculation: ['', Validators.required],
      date_immatriculation: ['', Validators.required],
      date_achat: ['', Validators.required],
      mileage: ['', [Validators.required, Validators.min(0)]],
      vehicle_fuel_type_id: ['', Validators.required],
      gearbox: ['manuelle', Validators.required],
      gray_card: [null, Validators.required],
      green_card: [null, Validators.required],
    });
    this.MyVehicleForm.get('brand_id')?.valueChanges.subscribe((brandId) => {
      this.loadModelsByBrand(brandId);
    });

    this.loadVehicleBrands();
    this.loadVehicleTypes();
    this.loadVehicleFuelTypes();
  }
  loadUnssignedVehicleTechnicians() {
    this.userService.getUnssignedVehicleTechnician().subscribe({
      next: (technicians: User[]) => {
        this.technicians = technicians;
        console.log(technicians);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des superviseurs :', err);
      },
    });
  }
  ngOnDestroy(): void {
    // Nettoyez la souscription pour éviter des fuites
    if (this.tablePageSizeSubscription) {
      this.tablePageSizeSubscription.unsubscribe();
      this.isOpen = false;
    }
  }
  private loadVehicleFuelTypes(): void {
    this.vehicleModelService.getVehicleFuelTypes().subscribe({
      next: (fuel_types: VehicleFuelType[]) => {
        this.fuel_types = fuel_types;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des marques :', err);
      },
    });
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

  loadModelsByBrand(brandId: number, callback?: () => void) {
    if (brandId) {
      this.vehicleModelService.getVehicleModelsByBrand(brandId).subscribe({
        next: (vehicle_models: VehicleModel[]) => {
          this.vehicle_models = vehicle_models;
          if (callback) callback(); // PATCH ICI le model_id APRÈS le chargement de la liste !
        },
        error: () => {
          this.vehicle_models = [];
          if (callback) callback();
        },
      });
    } else {
      this.vehicle_models = [];
      if (callback) callback();
    }
  }

  private loadVehicleTypes(): void {
    this.vehicleTypeService.getVehicleTypes().subscribe({
      next: (vehicle_types: VehicleType[]) => {
        this.vehicle_types = vehicle_types;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des marques :', err);
      },
    });
  }
  openAddModal(): void {
    this.MyVehicleForm.reset();
    this.isEditMode = false;
    this.editingId = undefined;
    this.formErrorMessage = '';

    const modalEl = document.getElementById('add_vehicle');
    if (modalEl) {
      const modalInstance = new bootstrap.Modal(modalEl);
      modalInstance.show();
    }
  }

  private resetFormAndCloseModal(): void {
    this.MyVehicleForm.reset();
    this.isEditMode = false;
    this.editingId = undefined;
    this.formErrorMessage = '';

    const modalEl = document.getElementById('add_vehicle');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();
    }
  }

  private loadVehicles(): void {
    this.loading = true;
    this.vehicleService.getVehicles().subscribe((vehicles: Vehicle[]) => {
      this.actualData = vehicles;
      this.totalData = vehicles.length;
      this.tableDataCopy = [...this.actualData];
      if (this.tablePageSizeSubscription) {
        this.tablePageSizeSubscription.unsubscribe();
      }
      this.tablePageSizeSubscription = this.pagination.tablePageSize.subscribe(
        (res: tablePageSize) => {
          this.getTableData({ skip: res.skip, limit: res.limit });
          this.pageSize = res.pageSize;
        }
      );
      this.loading = false;
    });
  }

  private getTableData(pageOption: pageSelection): void {
    this.tableData = [];
    this.serialNumberArray = [];
    this.actualData.forEach((vehicle: Vehicle, index: number) => {
      const serialNumber = index + 1;
      if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
        (vehicle as any).sNo = serialNumber;
        this.tableData.push(vehicle);
      }
    });

    // Met à jour le dataSource sans le recréer
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource<Vehicle>(this.tableData);
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

  trackById(index: number, item: Vehicle): number {
    return item.id ?? index;
  }
  onFileChange(event: Event, controlName: 'gray_card' | 'green_card'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.fileErrors[controlName] = '';
      this.MyVehicleForm.get(controlName)?.setValue(null);
      return;
    }

    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      this.fileErrors[controlName] =
        'Format invalide. Seuls JPG, PNG ou PDF sont autorisés.';
      this.MyVehicleForm.get(controlName)?.setValue(null);
      return;
    }

    if (file.size > maxSize) {
      this.fileErrors[controlName] = 'Le fichier ne doit pas dépasser 2 Mo.';
      this.MyVehicleForm.get(controlName)?.setValue(null);
      return;
    }

    this.fileErrors[controlName] = '';
    this.MyVehicleForm.get(controlName)?.setValue(file);
  }
  loadVehicleById(id: number): void {
    this.vehicleService.getVehicleById(id).subscribe({
      next: ({ vehicle, models_for_brand }) => {
        this.vehicle_models = models_for_brand;
        this.MyVehicleForm.patchValue({
          brand_id: vehicle.brand_id,
          plaque_immatriculation: vehicle.plaque_immatriculation,
          date_immatriculation: vehicle.date_immatriculation,
          date_achat: vehicle.date_achat,
          mileage: vehicle.mileage,
          vehicle_fuel_type_id: vehicle.fuel_type_id,
          gearbox: vehicle.gearbox,
          vehicle_type_id: vehicle.type_id,
          model_id: vehicle.model_id,
        });

        this.setFileValidatorsForEdit(vehicle);

        // Pour l’affichage de la miniature ou du lien de téléchargement
        this.currentGrayCardsUrl =
          typeof vehicle.gray_card === 'string' ? vehicle.gray_card : null;
        this.currentGreenCardUrl =
          typeof vehicle.green_card === 'string' ? vehicle.green_card : null;
        this.isEditMode = true;
        this.editingId = vehicle.id;

        // Ouvre le modal
        const modalEl = document.getElementById('add_vehicle');
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

  setFileValidatorsForEdit(vehicle: any) {
    // gray_card
    if (vehicle.gray_card) {
      this.MyVehicleForm.get('gray_card')?.clearValidators();
      this.MyVehicleForm.get('gray_card')?.updateValueAndValidity();
    } else {
      this.MyVehicleForm.get('gray_card')?.setValidators(Validators.required);
      this.MyVehicleForm.get('gray_card')?.updateValueAndValidity();
    }
    // green_card
    if (vehicle.green_card) {
      this.MyVehicleForm.get('green_card')?.clearValidators();
      this.MyVehicleForm.get('green_card')?.updateValueAndValidity();
    } else {
      this.MyVehicleForm.get('green_card')?.setValidators(Validators.required);
      this.MyVehicleForm.get('green_card')?.updateValueAndValidity();
    }
  }
  onSubmit(): void {
    if (this.MyVehicleForm.invalid) {
      this.MyVehicleForm.markAllAsTouched();
      return;
    }
    const fv = this.MyVehicleForm.value;
    const vehicleData: Vehicle = {
      ...fv,

      gray_card: fv.gray_card,
      green_card: fv.green_card,
    };

    if (this.isEditMode && this.editingId) {
      this.vehicleService.updateVehicle(this.editingId, vehicleData).subscribe({
        next: (updated) => {
          const idx = this.actualData.findIndex((u) => u.id === this.editingId);
          if (idx > -1) {
            this.actualData[idx] = updated;
            this.getTableData({ skip: this.skip, limit: this.limit });
          }
          this.messageService.add({
            summary: 'Succès',
            detail: 'véhicule modifié avec succès ✅',
            severity: 'success',
            styleClass: 'success-light-popover',
          });
          this.resetFormAndCloseModal();
        },
        error: (err) => {
          this.resetFormAndCloseModal();
          if (err.status === 422) {
            this.resetFormAndCloseModal();
            if (err.error?.errors?.plaque_immatriculation?.[0]) {
              this.formErrorMessage =
                err.error.errors.plaque_immatriculation[0];
            } else {
              this.formErrorMessage = 'Erreur serveur, veuillez réessayer';
            }
            setTimeout(() => (this.formErrorMessage = ''), 6000);
          }
          console.log('Erreur reçue depuis le backend :', err);
        },
      });
    } else {
      // CRÉATION
      this.vehicleService.createVehicle(vehicleData).subscribe({
        next: (created) => {
          this.actualData.unshift(created);
          console.log(created);
          this.getTableData({ skip: this.skip, limit: this.limit });
          this.totalData++;
          this.messageService.add({
            summary: 'Succès',
            detail: 'Véhicule ajoutée avec succès ✅',
            severity: 'success',
            styleClass: 'success-light-popover',
          });
          this.resetFormAndCloseModal();
        },
        error: (err) => {
          this.resetFormAndCloseModal();
          if (err.status === 422) {
            if (err.error?.errors?.plaque_immatriculation?.[0]) {
              this.formErrorMessage =
                err.error.errors.plaque_immatriculation[0];
            } else {
              this.formErrorMessage = 'Erreur serveur, veuillez réessayer';
            }
            setTimeout(() => (this.formErrorMessage = ''), 6000);
          }
          console.log('Erreur reçue depuis le backend :', err);
        },
      });
    }
  }
  confirmDelete(id: number): void {
    this.selectedDeleteId = id;
    const modalEl = document.getElementById('delete_modal_vehicle');
    if (modalEl) {
      const modalInstance = new bootstrap.Modal(modalEl);
      modalInstance.show();
    }
  }
  deleteSelectedVehicle(): void {
    if (!this.selectedDeleteId) return;

    this.vehicleService.deleteVehicle(this.selectedDeleteId).subscribe({
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
  confirmAssignTechnician(vehicleId: number): void {
    this.selectedAssignVehicleId = vehicleId;

    const modalEl = document.getElementById('assign_vehicle_modal');
    if (modalEl) {
      const modalInstance = new bootstrap.Modal(modalEl);
      modalInstance.show();
    }
  }
  onAssignSubmit(): void {
    if (this.MyassignForm.invalid) {
      this.MyassignForm.markAllAsTouched();
      return;
    }
    const formValue = this.MyassignForm.value;
    if (!this.selectedAssignVehicleId) return;
    this.vehicleService
      .assignVehicleToTechnician({
        vehicule_id: this.selectedAssignVehicleId,
        technicien_id: formValue.technicien_id,
        date_affectation: formValue.date_affectation,
      })
      .subscribe({
        next: (vehicle) => {
          // Met à jour le véhicule directement dans tableData
          const idx = this.tableData.findIndex((v) => v.id === vehicle.id);
          if (idx > -1) {
            this.tableData[idx] = vehicle;
          }
          this.messageService.add({
            summary: 'Succès',
            detail: 'Véhicule affecté avec succès',
            severity: 'success',
            styleClass: 'success-light-popover',
          });
          // Ferme la modal ici si besoin
          const modalEl = document.getElementById('assign_vehicle_modal');
          if (modalEl) {
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance?.hide();
          }
        },
        error: (err) => {
          this.messageService.add({
            summary: 'Erreur',
            detail: err?.error?.message || 'Erreur lors de l’affectation.',
            severity: 'error',
          });
        },
      });
  }

  showAssignmentInfo(vehicleId: number): void {
    this.selectedVehicleRestitueId = vehicleId;
    this.vehicleService.getVehicleAssignmentInfo(vehicleId).subscribe({
      next: (assignment) => {
        this.assignmentInfo = assignment;
        const modalEl = document.getElementById('show_assignment_info_modal');
        if (modalEl) {
          const modalInstance = new bootstrap.Modal(modalEl);
          modalInstance.show();
        }
      },
      error: (err) => {
        this.assignmentInfo = null;
        console.error('Erreur lors de la récupération:', err);
      },
    });
  }

  onRestituerVehicule(): void {
    if (
      !this.selectedVehicleRestitueId ||
      !this.assignmentInfo ||
      !this.assignmentInfo.technicien_id
    ) {
      this.messageService.add({
        summary: 'Erreur',
        detail: 'Données incomplètes pour la restitution du véhicule.',
        severity: 'error',
      });
      return;
    }
    this.vehicleService
      .restituteVehicle(
        this.selectedVehicleRestitueId, // Vehicule ID
        this.assignmentInfo.technicien_id // Technicien ID
      )
      .subscribe({
        next: (vehicle) => {
          // Met à jour la ligne du véhicule dans le tableau (comme pour assign)
          const idx = this.tableData.findIndex((v) => v.id === vehicle.id);
          if (idx > -1) {
            this.tableData[idx] = vehicle;
          }
          this.messageService.add({
            summary: 'Succès',
            detail: 'Véhicule restitué avec succès.',
            severity: 'success',
            styleClass: 'success-light-popover',
          });

          // Ferme la modal si tu veux être sûr
          const modalEl = document.getElementById('show_assignment_info_modal');
          if (modalEl) {
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance?.hide();
          }
        },
        error: (err) => {
          this.messageService.add({
            summary: 'Erreur',
            detail: err?.error?.message || 'Erreur lors de la restitution.',
            severity: 'error',
          });
        },
      });
  }
}
