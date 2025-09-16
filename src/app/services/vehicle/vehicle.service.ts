import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Vehicle } from '../../models/vehicle';
import { catchError, map, Observable, throwError } from 'rxjs';
import { VehicleModel } from '../../models/vehicleModel';
import { VehicleAssigment } from '../../models/vehicleAssigment';
import { VehicleAssignmentHistory } from '../../models/vehicleAssignmentHistory';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) {}

  getVehicles(): Observable<Vehicle[]> {
    return this.http
      .get<{ message: string; vehicles: Vehicle[] }>(`${this.baseUrl}vehicles`)
      .pipe(
        map((response) => response.vehicles),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }

  getVehicleById(
    id: number
  ): Observable<{ vehicle: Vehicle; models_for_brand: VehicleModel[] }> {
    return this.http
      .get<{ vehicle: Vehicle; models_for_brand: VehicleModel[] }>(
        `${this.baseUrl}vehicles/edit/${id}`
      )
      .pipe(
        map((response) => ({
          vehicle: response.vehicle,
          models_for_brand: response.models_for_brand,
        })),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }

  createVehicle(vehicleData: Vehicle): Observable<Vehicle> {
    const formData = new FormData();

    Object.keys(vehicleData).forEach((key) => {
      const value = vehicleData[key as keyof Vehicle];
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return this.http
      .post<{ message: string; vehicle: Vehicle }>(
        `${this.baseUrl}vehicles/add`,
        formData
      )
      .pipe(
        map((res) => res.vehicle),
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
  }

  updateVehicle(id: number, vehicleData: Vehicle): Observable<Vehicle> {
    // Création d'un FormData pour gérer les fichiers
    const formData = new FormData();

    Object.keys(vehicleData).forEach((key) => {
      const value = vehicleData[key as keyof Vehicle];
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString()); // string ou number
        }
      }
    });

    // Utilisation de PUT pour la mise à jour
    return this.http
      .post<{ message: string; data: Vehicle }>(
        `${this.baseUrl}vehicles/update/${id}`,
        formData
      )
      .pipe(
        map((res) => res.data),
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
  }
  deleteVehicle(id: number): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}vehicles/delete/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => throwError(() => error)));
  }
  getArchiveVehicles(): Observable<Vehicle[]> {
    return this.http
      .get<{ message: string; vehicles: Vehicle[] }>(
        `${this.baseUrl}vehicles/trashed`
      )
      .pipe(
        map((response) => response.vehicles),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }

  restoreVehicle(id: number): Observable<any> {
    return this.http
      .post(`${this.baseUrl}vehicles/restore/${id}`, {})
      .pipe(catchError((error: HttpErrorResponse) => throwError(() => error)));
  }

  assignVehicleToTechnician(data: {
    vehicule_id: number;
    technicien_id: number;
    date_affectation?: string;
  }): Observable<Vehicle> {
    return this.http
      .post<{ success: boolean; message: string; vehicle: Vehicle }>(
        `${this.baseUrl}vehicle-assignments/assign`,
        data
      )
      .pipe(map((response) => response.vehicle));
  }

  restituteVehicle(
    vehicule_id: number,
    technicien_id: number
  ): Observable<Vehicle> {
    return this.http
      .post<{ success: boolean; vehicle: Vehicle }>(
        `${this.baseUrl}vehicle-assignments/restitution`,
        { vehicule_id, technicien_id }
      )
      .pipe(map((res) => res.vehicle));
  }

  getVehicleAssignmentInfo(
    vehicleId: number
  ): Observable<VehicleAssigment | null> {
    return this.http
      .get<{ success: boolean; assignment: VehicleAssigment | null }>(
        `${this.baseUrl}vehicle/assignment-info/${vehicleId}`
      )
      .pipe(map((res) => res.assignment));
  }

  getVehicleStats(): Observable<{
    total_vehicle: number;
    assigned_vehicle: number;
    unassigned_vehicle: number;
  }> {
    return this.http.get<{
      total_vehicle: number;
      assigned_vehicle: number;
      unassigned_vehicle: number;
    }>(`${this.baseUrl}vehicles/stats`);
  }

  getVehiclesAssignments(): Observable<VehicleAssigment[]> {
    return this.http
      .get<{ message: string; vehicles_dep: VehicleAssigment[] }>(`${this.baseUrl}vehicle-assignments`)
      .pipe(
        map((response) => response.vehicles_dep),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }

  getVehicleStatusStats() {
  return this.http.get<{success: boolean, data: any[], total: number}>(`${this.baseUrl}vehicles/status-stats`);
}
getVehicleAssigmentHistory(filters: {
    vehicule_id?: number,
    technicien_id?: number,
    mois?: number,
    annee?: number
  } = {}): Observable<VehicleAssignmentHistory[]> {
    return this.http.post<{historiques : VehicleAssignmentHistory[]}>(`${this.baseUrl}vehicle-assignments/history`, filters).pipe(
        map((response) => response.historiques),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );;
  }
}
