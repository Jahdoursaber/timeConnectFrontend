import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { VehicleModel } from '../../models/vehicleModel';
import { VehicleFuelType } from '../../models/vehicleFuelType';

@Injectable({
  providedIn: 'root',
})
export class VehicleModelService {
  private baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) {}

  getVehicleModels(): Observable<VehicleModel[]> {
    return this.http
      .get<{ message: string; models: VehicleModel[] }>(`${this.baseUrl}models`)
      .pipe(
        map((response) => response.models),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }

  getVehicleModelById(id: number): Observable<VehicleModel> {
    return this.http
      .get<{ model: VehicleModel }>(`${this.baseUrl}models/edit/${id}`)
      .pipe(
        map((response) => response.model),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }

  addVehicleModel(model: VehicleModel): Observable<VehicleModel> {
    return this.http
      .post<{ message: string; model: VehicleModel }>(
        `${this.baseUrl}models/add`,
        model
      )
      .pipe(
        map((response) => response.model),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  updateVehicleModel(id: number, data: VehicleModel): Observable<VehicleModel> {
    return this.http
      .put<{ model: VehicleModel }>(`${this.baseUrl}models/update/${id}`, data)
      .pipe(
        map((res) => res.model),
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
  }

  deleteVehicleModel(id: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}models/delete/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => throwError(() => error)));
  }
  getVehicleModelsByBrand(brandId: number): Observable<VehicleModel[]> {
    return this.http
      .get<{ message: string; models: VehicleModel[] }>(`${this.baseUrl}models/brands/${brandId}`)
      .pipe(
        map((response) => response.models),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }

  getVehicleFuelTypes(): Observable<VehicleFuelType[]> {
    return this.http
      .get<{ message: string; fuel_types: VehicleFuelType[] }>(`${this.baseUrl}vehicles-fuel-types`)
      .pipe(
        map((response) => response.fuel_types),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }

  getArchiveVehicleModels(): Observable<VehicleModel[]> {
        return this.http
          .get<{ message: string; models: VehicleModel[] }>(`${this.baseUrl}models/trashed`)
          .pipe(
            map((response) => response.models),
            catchError((error: HttpErrorResponse) => throwError(() => error))
          );
      }

      restoreVehicleModel(id: number): Observable<any> {
        return this.http.post(`${this.baseUrl}models/restore/${id}`, {}).pipe(
          catchError((error: HttpErrorResponse) => throwError(() => error))
        );
      }
}
