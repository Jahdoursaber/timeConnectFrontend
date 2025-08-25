import { Component } from '@angular/core';
import {
  pageSelection,
  pageSize,
  pageSizeCal,
  PaginationService,
} from './pagination.service';
import { routes } from '../routes/routes';

@Component({
    selector: 'app-custom-pagination',
    templateUrl: './custom-pagination.component.html',
    styleUrls: ['./custom-pagination.component.scss'],
    standalone: false
})
export class CustomPaginationComponent {

  public routes = routes;
  public pageSize = 10;
  public tableData: Array<string> = [];
  // pagination variables
  public lastIndex = 0;
  public totalData = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<pageSelection> = [];
  public pagesToShow: Array<number | '...'> = [];
  public totalPages = 0;
  // pagination variables end

  constructor(private pagination: PaginationService) {
    this.tableData = [];
    this.pagination.calculatePageSize.subscribe((res: pageSizeCal) => {
      this.calculateTotalPages(
        res.totalData,
        res.pageSize,
        res.tableData,
        res.serialNumberArray
      );
      this.pageSize = res.pageSize;
    });
    this.pagination.changePagesize.subscribe((res: pageSize) => {
      this.changePageSize(res.pageSize);
    });
  }
  private updatePagesToShow(): void {
    const total = this.totalPages;
    const current = this.currentPage;
    const maxVisible = 5;                  // on veut toujours 5 numéros en début/fin
    const pages: Array<number | '...'> = [];

    // si le nombre total de pages est petit, on affiche tout
    if (total <= maxVisible + 2) {
      // +2 pour les deux ellipses potentielles,
      // mais comme total est petit, on n'affiche que les pages
      for (let i = 1; i <= total; i++) pages.push(i);
    }
    // cas “début” : page 1 à 5
    else if (current <= Math.ceil(maxVisible / 2)) {
      for (let i = 1; i <= maxVisible; i++) pages.push(i);
      pages.push('...', total);
    }
    // cas “fin” : on affiche les 5 dernières pages
    else if (current > total - Math.floor(maxVisible / 2)) {
      pages.push(1, '...');
      for (let i = total - maxVisible + 1; i <= total; i++) pages.push(i);
    }
    // cas “milieu” : on centre current
    else {
      pages.push(1, '...');
      const window = Math.floor(maxVisible / 2);
      for (let i = current - window; i <= current + window; i++) {
        pages.push(i);
      }
      pages.push('...', total);
    }

    this.pagesToShow = pages;
  }
  public getMoreData(direction: 'next' | 'previous'): void {
    if (direction === 'next' && this.currentPage < this.totalPages) {
      this.currentPage++;
    } else if (direction === 'previous' && this.currentPage > 1) {
      this.currentPage--;
    } else {
      return;
    }

    // recalcul des skip/limit
    const sel = this.pageSelection[this.currentPage - 1];
    this.skip = sel.skip;
    this.limit = sel.limit;

    // mise à jour pagination
    this.updatePagesToShow();

    // émission vers le service pour recharger la table
    this.pagination.tablePageSize.next({
      skip: this.skip,
      limit: this.limit,
      pageSize: this.pageSize,
    });
  }

  public moveToPage(page: number | '...'): void {
    if (page === '...') {
      return;
    }
    this.currentPage = page;

    const sel = this.pageSelection[this.currentPage - 1];
    this.skip = sel.skip;
    this.limit = sel.limit;

    this.updatePagesToShow();

    this.pagination.tablePageSize.next({
      skip: this.skip,
      limit: this.limit,
      pageSize: this.pageSize,
    });
  }

  public changePageSize(newSize: number): void {
    this.pageSize = newSize;
    this.skip = 0;
    this.limit = newSize;
    this.currentPage = 1;

    // re-émettre pour recharger
    this.pagination.tablePageSize.next({
      skip: this.skip,
      limit: this.limit,
      pageSize: this.pageSize,
    });
  }

  public calculateTotalPages(
    totalData: number,
    pageSize: number,
    tableData: Array<string>,
    serialNumberArray: Array<number>
  ): void {
    this.tableData = tableData;
    this.totalData = totalData;
    this.pageNumberArray = [];
    this.serialNumberArray = serialNumberArray;

    this.totalPages = Math.ceil(this.totalData / pageSize);
    this.pageNumberArray = Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );
    this.pageSelection = this.pageNumberArray.map((p, idx) => ({
      skip: idx * pageSize,
      limit: (idx + 1) * pageSize
    }));
    this.updatePagesToShow();
  }
}
