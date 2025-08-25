import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { VehicleType } from '../../models/vehicleType';

@Injectable({
  providedIn: 'root'
})
export class VehicleTypeService {
  private baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) { }

   getVehicleTypes(): Observable<VehicleType[]> {
    return this.http
      .get<{ message: string; vehicle_types: VehicleType[] }>(`${this.baseUrl}vehicles-types`)
      .pipe(
        map((response) => response.vehicle_types),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }

  getVehicleTypeById(id: number): Observable<VehicleType> {
    return this.http
      .get<{ vehicleType: VehicleType }>(`${this.baseUrl}vehicles-types/edit/${id}`)
      .pipe(
        map((response) => response.vehicleType),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }

  addVehicleType(vehicleType: VehicleType): Observable<VehicleType> {
    return this.http
      .post<{ message: string; vehicleType: VehicleType }>(
        `${this.baseUrl}vehicles-types/add`,
        vehicleType
      )
      .pipe(
        map((response) => response.vehicleType),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  updateVehicleType(id: number, data: VehicleType): Observable<VehicleType> {
    return this.http
      .put<{ vehicleType: VehicleType }>(`${this.baseUrl}vehicles-types/update/${id}`, data)
      .pipe(
        map((res) => res.vehicleType),
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
  }

  deleteVehicleType(id: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}vehicles-types/delete/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => throwError(() => error)));
  }

       getArchiveVehicleTypes(): Observable<VehicleType[]> {
          return this.http
            .get<{ message: string; vehicle_types: VehicleType[] }>(`${this.baseUrl}vehicles-types/trashed`)
            .pipe(
              map((response) => response.vehicle_types),
              catchError((error: HttpErrorResponse) => throwError(() => error))
            );
        }
        restoreVehicleType(id: number): Observable<any> {
          return this.http.post(`${this.baseUrl}vehicles-types/restore/${id}`, {}).pipe(
            catchError((error: HttpErrorResponse) => throwError(() => error))
          );
        }
}
