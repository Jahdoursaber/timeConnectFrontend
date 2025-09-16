import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { VehicleBrand } from '../../models/vehicleBrand';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VehicleBrandService {
  private baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) {}

  getVehicleBrands(): Observable<VehicleBrand[]> {
    return this.http
      .get<{ message: string; brands: VehicleBrand[] }>(`${this.baseUrl}brands`)
      .pipe(
        map((response) => response.brands),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }

  getVehicleBrandById(id: number): Observable<VehicleBrand> {
    return this.http
      .get<{ brand: VehicleBrand }>(`${this.baseUrl}brands/edit/${id}`)
      .pipe(
        map((response) => response.brand),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }

  addVehicleBrand(brand: VehicleBrand): Observable<VehicleBrand> {
    return this.http
      .post<{ message: string; brand: VehicleBrand }>(
        `${this.baseUrl}brands/add`,
        brand
      )
      .pipe(
        map((response) => response.brand),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  updateVehicleBrand(id: number, data: VehicleBrand): Observable<VehicleBrand> {
    return this.http
      .put<{ brand: VehicleBrand }>(`${this.baseUrl}brands/update/${id}`, data)
      .pipe(
        map((res) => res.brand),
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
  }

  deleteVehicleBrand(id: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}brands/delete/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => throwError(() => error)));
  }
  getArchiveVehicleBrands(): Observable<VehicleBrand[]> {
      return this.http
        .get<{ message: string; brands: VehicleBrand[] }>(`${this.baseUrl}brands/trashed`)
        .pipe(
          map((response) => response.brands),
          catchError((error: HttpErrorResponse) => throwError(() => error))
        );
    }

    restoreVehicleBrand(id: number): Observable<any> {
      return this.http.post(`${this.baseUrl}brands/restore/${id}`, {}).pipe(
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
    }
}
