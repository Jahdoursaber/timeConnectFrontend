import { HttpClient,HttpErrorResponse } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { environment } from '../../../environment';
import { Company } from '../models/company';
import { Observable,map,throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private baseUrl = environment.baseUrl;;

  constructor(private http:HttpClient) {  }

  getAllCompany() : Observable<Company[]> {
    return this.http.get<any>(this.baseUrl + 'companies').pipe(
      map((res) => res.companies)
    );
  }
  addCompany(company: Company): Observable<Company> {
      return this.http.post<{ message: string, company: Company }>(
        `${this.baseUrl}add/company`, company
      ).pipe(
        map(response => response.company),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
    }
  getCompanyById(id: number): Observable<Company> {
      return this.http.get<{ company: Company }>(`${this.baseUrl}edit/company/${id}`).pipe(
        map(response => response.company),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
    }
    updateCompany(id: number, data: Company): Observable<Company> {
        return this.http.put<{ company: Company }>(`${this.baseUrl}update/company/${id}`, data).pipe(
          map(res => res.company),
          catchError((err: HttpErrorResponse) => throwError(() => err))
        );
      }
      deleteCompany(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}delete/company/${id}`).pipe(
          catchError((error: HttpErrorResponse) => throwError(() => error))
        );
      }

}
