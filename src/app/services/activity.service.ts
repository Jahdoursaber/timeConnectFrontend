import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map,throwError  } from 'rxjs';
import { Activity, } from '../models/activity';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private baseUrl = environment.baseUrl;
  constructor(private http:HttpClient) { }

  getAllActivity(): Observable<Activity[]> {
    return this.http.get<any>(this.baseUrl + 'activities').pipe(
      map((res) => res.activities)
    );
  }

  addActivity(activity: Activity): Observable<Activity> {
    return this.http.post<{ message: string, activity: Activity }>(
      `${this.baseUrl}add/activity`, activity
    ).pipe(
      map(response => response.activity),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  getActivityById(id: number): Observable<Activity> {
    return this.http.get<{ activity: Activity }>(`${this.baseUrl}edit/activity/${id}`).pipe(
      map(response => response.activity),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  updateActivity(id: number, data: Activity): Observable<Activity> {
    return this.http.put<{ activity: Activity }>(`${this.baseUrl}update/activity/${id}`, data).pipe(
      map(res => res.activity),
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }

  deleteActivity(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}delete/activity/${id}`).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
   unassignSupervisor(id: number):Observable<any>{
    return this.http.patch(`${this.baseUrl}activity/unassign-supervisor/${id}`,{}).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }

}
