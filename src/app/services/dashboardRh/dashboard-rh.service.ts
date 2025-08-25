import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { HttpClient } from '@angular/common/http';
import { RequestStatsDTO } from '../../models/requestStat';
import { Observable } from 'rxjs';
export interface LeavesMonthlyDTO {
  success: boolean;
  year: number;
  months: string[];  // 12 labels
  totals: number[];  // 12 valeurs
}
@Injectable({
  providedIn: 'root'
})

export class DashboardRhService {
  baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) { }

  getRequestStats() {
    return this.http.get<RequestStatsDTO>(`${this.baseUrl}dashboard/request-stats`);
  }

  getDashboardRhStats():Observable<{
    total_RH: number;
    total_Sup: number;
    total_Technician: number;
    total_company: number;
    total_activity: number;
  }>{
    return this.http.get<{
      total_RH: number;
      total_Sup: number;
      total_Technician: number;
      total_company: number;
      total_activity: number;
    }>(`${this.baseUrl}dashboard/stats`);
  }

  getLeavesMonthlyStats(): Observable<LeavesMonthlyDTO> {
    return this.http.get<LeavesMonthlyDTO>(`${this.baseUrl}leaves/monthly-stats`);
  }
}
