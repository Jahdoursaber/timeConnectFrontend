import { HttpClient, HttpErrorResponse  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Job } from '../models/job';
import { Observable,map,throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class JobService {
  private baseUrl = 'http://127.0.0.1:8000/api/spa/';

  constructor(private http: HttpClient) { }

  getAllJobs(): Observable<Job[]> {
      return this.http.get<any>(this.baseUrl + 'jobs').pipe(
        map((res) => res.jobs)
      );
    }

    addJob(job: Job): Observable<Job> {
      return this.http.post<{ message: string, job: Job }>(
        `${this.baseUrl}add/job`, job
      ).pipe(
        map(response => response.job),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
    }

    getJobById(id: number): Observable<Job> {
      return this.http.get<{ job: Job }>(`${this.baseUrl}edit/job/${id}`).pipe(
        map(response => response.job),
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
    }

    updateJob(id: number, data: Job): Observable<Job> {
      return this.http.put<{ job: Job }>(`${this.baseUrl}update/job/${id}`, data).pipe(
        map(res => res.job),
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
    }

    deleteJob(id: number): Observable<any> {
      return this.http.delete(`${this.baseUrl}delete/job/${id}`).pipe(
        catchError((error: HttpErrorResponse) => throwError(() => error))
      );
    }
}
