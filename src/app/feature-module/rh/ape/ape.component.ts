import { Component, OnDestroy } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { breadCrumbItems, pageSelection } from '../../../shared/models/models';

import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PaginationService, tablePageSize } from '../../../shared/custom-pagination/pagination.service';
import { Sort } from '@angular/material/sort';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Ape } from '../../../models/ape';
import { ApeService } from '../../../services/ape.service';
declare var bootstrap: any;

@Component({
  selector: 'app-ape',
  standalone: false,
  templateUrl: './ape.component.html',
  styleUrl: './ape.component.scss'
})
export class ApeComponent implements OnDestroy {
  public routes = routes;

  // pagination variables
  pageSize = 10;
  tableData: Ape[] = [];
  tableDataCopy: Ape[] = [];
  actualData: Ape[] = [];
  public currentPage = 1;
  public skip = 0;
  public limit: number = this.pageSize;
  serialNumberArray: number[] = [];
  totalData = 0;
  showFilter = false;
  public pageSelection: pageSelection[] = [];
  dataSource!: MatTableDataSource<Ape>;
  public searchDataValue = '';
  breadCrumbItems: breadCrumbItems[] = [];
  isOpen = false
  myFormActivity!: FormGroup;
  public formErrorMessage: string = '';
  selectedActivity!: Ape;
  isEditMode: boolean = false;
  editingId?: number;
  selectedDeleteId?: number;
  ngOnDestroy(): void {
    this.isOpen = false
  }

  constructor(
    private apeService: ApeService,
    private router: Router,
    private pagination: PaginationService,
    private fb: FormBuilder
  ) {
    this.breadCrumbItems = [
      { label: 'Entreprise/Activités' },
      { label: 'Codes Apes', active: true }
    ];

  }


  ngOnInit(): void {
    this.loadApes();

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
  loadApes(): void {
    this.apeService.getAllApes().subscribe((apes: Ape[]) => {

      this.actualData = apes;
      this.totalData = apes.length;
      this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
        if (this.router.url == this.routes.apes) {
          this.getTableData({ skip: res.skip, limit: res.limit });
          this.pageSize = res.pageSize;
        }
      });
    });
  }
  private getTableData(pageOption: pageSelection): void {
    this.apeService.getAllApes().subscribe((apes: Ape[]) => {
      this.tableData = [];
      this.tableDataCopy = [];
      this.serialNumberArray = [];
      this.actualData.forEach((collective: Ape, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          (collective as any).sNo = serialNumber; // Ajouter le numéro de série
          this.tableData.push(collective);
          this.tableDataCopy.push(collective);
          this.serialNumberArray.push(serialNumber);
        }
      });
      this.dataSource = new MatTableDataSource<Ape>(this.actualData);
      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        tableDataCopy: this.tableDataCopy,
        serialNumberArray: this.serialNumberArray,

      });

    });
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
}
