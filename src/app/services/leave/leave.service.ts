import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Leave } from '../../models/leave';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { LeaveType } from '../../models/leaveType';
import { CalendarResource } from '../../models/CalendarResource';
import { LeaveEvent } from '../../models/LeaveEvent';
import { LeaveBalance } from '../../models/leaveBalance';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) {

  }
  getLeavesSuperviseur(): Observable<Leave[]> {
    return this.http.get<{ message: string, data: Leave[] }>(`${this.baseUrl}leaves/supervisor`).pipe(
      map(response => response.data),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
  getLeavesRH(): Observable<Leave[]> {
    return this.http.get<{ message: string, data: Leave[] }>(`${this.baseUrl}leaves/supervisor`).pipe(
      map(response => response.data),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  getLeaveById(id: number): Observable<Leave> {
    return this.http.get<{ leave: Leave }>(`${this.baseUrl}leaves/edit/${id}`).pipe(
      map(response => response.leave),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
  getStatusOptions(): Observable<Leave[]> {
    return this.http.get<Leave[]>(`${this.baseUrl}leaves/status-options`)
      .pipe(catchError(this.handleError));
  }
  private handleError(error: HttpErrorResponse) {
    console.error('Erreur API:', error);
    return throwError(() => error);
  }

  updateLeave(id: number, data: { reply: string; status: string }): Observable<Leave> {
    return this.http.patch<{ leave: Leave }>(`${this.baseUrl}leaves/update/${id}`, data).pipe(
      map(res => res.leave), // on récupère seulement l'objet advance
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
  filterLeavesByStatus(status: string): Observable<Leave[]> {
    return this.http.get<Leave[]>(`${this.baseUrl}leaves/filter`, {
      params: { status }
    });
  }
  getLeavesTypes(): Observable<LeaveType[]> {
    return this.http.get<{ message: string, leavesTypes: LeaveType[] }>(`${this.baseUrl}leaves-type`).pipe(
      map(response => response.leavesTypes),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }

  filterLeavesByLeaveType(leave_type_id: number): Observable<Leave[]> {
    return this.http.get<Leave[]>(`${this.baseUrl}leaves/filter-type`, {
      params: { leave_type_id }
    });
  }
  getLeaveStats(): Observable<{
    acceptedL1: number;
    acceptedL2: number;
    rejected: number;
    pending: number;
    proposed_other_date: number;
  }> {
    return this.http.get<{
      acceptedL1: number;
      acceptedL2: number;
      rejected: number;
      pending: number;
      proposed_other_date: number;
    }>(`${this.baseUrl}leaves/stats`);
  }
  getLeavesByMonth(month: string): Observable<Leave[]> {
    return this.http.get<any>(`${this.baseUrl}leaves/calendar?month=${month}`).pipe(
      map(res => res.data as Leave[])
    );
  }

  getLeaveCalendar(start: string, end: string): Observable<{ resources: CalendarResource[]; events: LeaveEvent[] }> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<{
      resources: CalendarResource[];
      events: LeaveEvent[];
    }>(this.baseUrl + 'leaves/calendar', { params });
  }
  getLeaveHistoryByUser(userId: number): Observable<Leave[]> {
    return this.http.get<{ data: Leave[] }>(`${this.baseUrl}leaves/history/${userId}`)
      .pipe(map(res => res.data),
      catchError(() => of([])));
  }

  getLeaveBalanceByUser(userId: number): Observable<LeaveBalance> {
  return this.http.get<{ data: LeaveBalance }>(`${this.baseUrl}leaves/taken/${userId}`)
    .pipe(
      map(res => res.data),
      catchError(() => of({
        TotalLeave: 0,
        LeaveTaken: 0,
        LeaveLeft: 0,
        ReferencePeriod: { start: '', end: '' }
      }))
    );
}
}
