import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable, catchError, throwError, tap } from 'rxjs';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) { }

  getUsersByRoles(role: string): Observable<User[]> {
    return this.http.get<any>(`${this.baseUrl}users/${role}`).pipe(
      map((res) => res.users),
      catchError(this.handleError)
    );
  }
  getExportUsers(role: string): Observable<HttpResponse<Blob>>{
    return this.http.get(`${this.baseUrl}users/export/${role}`, {
      responseType: 'blob',
      observe: 'response'
    });
  }
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => errorMessage);
  }

  createUser(userData: User, role: string): Observable<User> {
    // Création d'un FormData pour gérer les fichiers
    const formData = new FormData();

    // Ajout des champs textuels
    Object.keys(userData).forEach(key => {
      const value = userData[key as keyof User];
      if (value !== null && value !== undefined && !(value instanceof File)) {
        formData.append(key, String(value));
      }
    });

    // Ajout des fichiers s'ils existent
    if (userData.bank_details instanceof File) {
      formData.append('bank_details', userData.bank_details);
    }

    if (userData.vital_card instanceof File) {
      formData.append('vital_card', userData.vital_card);
    }

    return this.http.post<User>(`${this.baseUrl}users/${role}`, formData);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<{ user: User }>(`${this.baseUrl}edit/user/${id}`).pipe(
      map(response => response.user),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  updateUser(id: number, userData: User): Observable<User> {
    // Création d'un FormData pour gérer les fichiers
    const formData = new FormData();

    // Ajout des champs textuels
    Object.keys(userData).forEach(key => {
      const value = userData[key as keyof User];
      if (value !== null && value !== undefined && !(value instanceof File)) {
        formData.append(key, String(value));
      }
    });

    // Ajout des fichiers s'ils existent
    if (userData.bank_details instanceof File) {
      formData.append('bank_details', userData.bank_details);
    }

    if (userData.vital_card instanceof File) {
      formData.append('vital_card', userData.vital_card);
    }

    // Utilisation de PUT pour la mise à jour
    return this.http.post<User>(`${this.baseUrl}update/user/${id}`, formData);
  }


  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}delete/user/${id}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  getUnssignedSupervisor(): Observable<User[]> {
    return this.http.get<any>(this.baseUrl + 'activity/unassigned-supervisors').pipe(
      map((res) => res.supervisors)
    );
  }
  getUsersByActivity(role: string, activityId: number): Observable<User[]> {
    console.log('ROLE envoyé:', role, 'ACTIVITY_ID:', activityId);
  return this.http.get<any>(`${this.baseUrl}users/${role}/${activityId}`)
    .pipe(map(res => res.users));
  }

  getTechniciensBySupervisor(): Observable<User[]> {
    return this.http.get<any>(`${this.baseUrl}technicians/supervisor`).pipe(
      map((res) => res.techniciens),
      catchError(this.handleError)
    );
  }
  AffectActitivyToTechnicien(id: number):Observable<any>{
      return this.http.patch(`${this.baseUrl}affect/activity/technician/${id}`,{}).pipe(
        catchError((error: HttpErrorResponse) => throwError(() => error))
        );
    }
  getArchiveUsers(): Observable<User[]> {
    return this.http.get<{users : User[]}>(`${this.baseUrl}archive/users`).pipe(
      map((res) => res.users),
      catchError(this.handleError)
    );
  }
  restoreUser(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/restore/${id}`, {}).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
  getTechniciansHistory(): Observable<User[]> {
    return this.http.get<{users : User[]}>(`${this.baseUrl}technicians/history`).pipe(
      map((res) => res.users),
      catchError(this.handleError)
    );
  }
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}profile`, data, { withCredentials: true });
  }

  getUnssignedVehicleTechnician(): Observable<User[]> {
      return this.http.get<any>(this.baseUrl + 'technicians/available').pipe(
        map((res) => res.technicians)
      );
    }

  getAllTechnicians(): Observable<User[]> {
    return this.http.get<any>(`${this.baseUrl}all-technicians`).pipe(
      map((res) => res.technicians),
      catchError(this.handleError)
    );
  }
}
