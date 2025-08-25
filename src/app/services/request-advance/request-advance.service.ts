import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { AdvanceRequest } from '../../models/advanceRequest';

@Injectable({
  providedIn: 'root'
})
export class RequestAdvanceService {
  private baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) { }

  getAdvanceRequests(): Observable<AdvanceRequest[]> {
    return this.http.get<{ message: string, advance_list: AdvanceRequest[] }>(`${this.baseUrl}advance-requests`).pipe(
      map(response => response.advance_list),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
  getAdvanceById(id: number): Observable<AdvanceRequest> {
    return this.http.get<{ advance: AdvanceRequest }>(`${this.baseUrl}advance-request/edit/${id}`).pipe(
      map(response => response.advance),
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
  getStatusOptions(): Observable<AdvanceRequest[]> {
    return this.http.get<AdvanceRequest[]>(`${this.baseUrl}advance-request/status-options`)
      .pipe(catchError(this.handleError));
  }
  private handleError(error: HttpErrorResponse) {
    console.error('Erreur API:', error);
    return throwError(() => error);
  }
  updateAdvanceRequest(id: number, data: { reply: string; status: string }): Observable<AdvanceRequest> {
    return this.http.patch<{ advance: AdvanceRequest }>(`${this.baseUrl}advance-request/update/${id}`, data).pipe(
      map(res => res.advance), // on récupère seulement l'objet advance
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
  filterAdvanceRequestsByStatus(status: string): Observable<AdvanceRequest[]> {
    return this.http.get<AdvanceRequest[]>(`${this.baseUrl}advance-requests/filter`, {
      params: { status }
    });
  }
  getAdvanceStats(): Observable<{
    accepted: number;
    rejected: number;
    pending: number;
  }> {
    return this.http.get<{
      accepted: number;
      rejected: number;
      pending: number;
    }>(`${this.baseUrl}advance-requests/stats`);
  }

  getAdvanceHistoryByUser(userId: number): Observable<AdvanceRequest[]> {
      return this.http.get<{ data: AdvanceRequest[] }>(`${this.baseUrl}advance-requests/history/${userId}`)
        .pipe(map(res => res.data),
        catchError(() => of([])));
    }
}

