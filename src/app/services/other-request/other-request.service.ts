import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { OtherRequest } from '../../models/otherRequest';

@Injectable({
  providedIn: 'root',
})
export class OtherRequestService {
  private baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) {}

  getOtherRequests(): Observable<OtherRequest[]> {
    return this.http
      .get<{ message: string; other_requests: OtherRequest[] }>(
        `${this.baseUrl}other-requests`
      )
      .pipe(
        map((response) => response.other_requests),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }
  getOtherRequestById(id: number): Observable<OtherRequest> {
    return this.http
      .get<{ other_request: OtherRequest }>(
        `${this.baseUrl}other-request/edit/${id}`
      )
      .pipe(
        map((response) => response.other_request),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }
  updateOtherRequest(
    id: number,
    otherRequestData: OtherRequest
  ): Observable<OtherRequest> {
    // Création d'un FormData pour gérer les fichiers
    const formData = new FormData();

    // Ajout des champs textuels
    Object.keys(otherRequestData).forEach((key) => {
      const value = otherRequestData[key as keyof OtherRequest];
      if (value !== null && value !== undefined && !(value instanceof File)) {
        formData.append(key, String(value));
      }
    });

    // Ajout des fichiers s'ils existent
    if (otherRequestData.reply_file instanceof File) {
      formData.append('reply_file', otherRequestData.reply_file);
    }
    // Utilisation de PUT pour la mise à jour
    return this.http
      .post<{ other_request: OtherRequest }>(
        `${this.baseUrl}other-request/update/${id}`,
        formData
      )
      .pipe(
        map((response) => response.other_request),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }
  getOtherRequestStats(): Observable<{
    total: number;
    replied: number;
    not_replied: number;
  }> {
    return this.http.get<{
      total: number;
      replied: number;
      not_replied: number;
    }>(`${this.baseUrl}other-requests/stats`);
  }

  filterOtherRequestsByReplied(isReplied: boolean): Observable<OtherRequest[]> {
    return this.http
      .get<{ other_requests: OtherRequest[] }>(
        `${this.baseUrl}other-requests/filter`,
        { params: { is_replied: isReplied } }
      )
      .pipe(
        map((response) => response.other_requests),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
  }
  getOtherRequestHistoryByUser(userId: number): Observable<OtherRequest[]> {
    return this.http
      .get<{ data: OtherRequest[] }>(
        `${this.baseUrl}other-requests/history/${userId}`
      )
      .pipe(
        map((res) => res.data),
        catchError(() => of([]))
      );
  }
}
