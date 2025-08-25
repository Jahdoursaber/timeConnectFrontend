import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { catchError, map, Observable, of } from 'rxjs';
import { AttendanceEmployee } from '../../models/attendace-employee';
import { TechnicianLocation } from '../../models/technicianLocation';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) { }

  getAttendanceEmployee(userId: number, month?: number, year?: number): Observable<{ data: AttendanceEmployee[], name: string }> {
   let url = `${this.baseUrl}attendances/history/${userId}`;
  if (month && year) {
    url += `?month=${month}&year=${year}`;
  }
  return this.http.get<{ data: AttendanceEmployee[], name: string }>(url)
    .pipe(
      catchError(() => of({ data: [], name: '' }))
    );
}

  getAttendanceStats(userId:number): Observable<{
    today_hours: number;
    week_hours: number;
    month_hours: number;
    started:string;
  }> {
    return this.http.get<{
      today_hours: number;
      week_hours: number;
      month_hours: number;
      started:string;
    }>(`${this.baseUrl}attendances/stats/${userId}`);
  }
//   getAttendanceEmployeeSummry(userId: number): Observable<AttendanceEmployee[]> {
//   return this.http.get<{data: AttendanceEmployee[] }>(`${this.baseUrl}attendances/statsByday/${userId}`)
//     .pipe(map(res => res.data),
//       catchError(() => of([])));
// }
 getTodayAttendanceSummary(userId: number): Observable<AttendanceEmployee | null> {
    return this.http.get<any>(`${this.baseUrl}attendances/statsByday/${userId}`)
      .pipe(
        map(res => res.data ?? null),
        catchError(() => of(null))
      );
  }

  getTodayTechnicianLocations(): Observable<TechnicianLocation[]> {
    return this.http.get<{status: boolean, data: TechnicianLocation[]}>(`${this.baseUrl}attendances/map/today`).pipe(
      map(res => res.data ?? []),
      catchError(() => of([]))
    );
  }
  getTodayAttendances(): Observable<{
    data: TechnicianLocation[];
    nb_total_pointages: number;
  }> {
    return this.http.get<{ data: TechnicianLocation[]; nb_total_pointages: number }>(
      `${this.baseUrl}attendances/today-summary`
    );
  }
}
