import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveStatsDTO } from '../../models/leaveStats';
import { TechnicianLocation } from '../../models/technicianLocation';

@Injectable({
  providedIn: 'root'
})
export class DashboardSupService {
   baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) { }

  getDashboardSupStats():Observable<{
      technician_without_activity: number;
      technician_with_activity: number;
      technician_on_leave: number;

    }>{
      return this.http.get<{
        technician_without_activity: number;
        technician_with_activity: number;
        technician_on_leave: number;

      }>(`${this.baseUrl}dashboard/technician-stats`);
    }

    getRequestStats() {
        return this.http.get<LeaveStatsDTO>(`${this.baseUrl}dashboard/leaves-stats`);
      }

    getTodayAttendancesSup(): Observable<{
        data: TechnicianLocation[];
        nb_total_pointages: number;
      }> {
        return this.http.get<{ data: TechnicianLocation[]; nb_total_pointages: number }>(
          `${this.baseUrl}dashboard/attendances-stats-sup`
        );
      }

}
