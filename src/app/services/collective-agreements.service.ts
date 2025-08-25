import { Injectable } from '@angular/core';
import { environment } from '../../../environment';
import { HttpClient } from '@angular/common/http';
import { Observable,map } from 'rxjs';
import { CollectiveAgreement } from '../models/collectiveAgreements';

@Injectable({
  providedIn: 'root'
})
export class CollectiveAgreementsService {
  baseUrl= environment.baseUrl;
  constructor(private http:HttpClient) { }

  getAllCollectiveAgreements(): Observable <CollectiveAgreement[]> {
    return this.http.get<{collectives: CollectiveAgreement[]}>(this.baseUrl + 'collectives').pipe(
          map((res) => res.collectives)
        );
  }
  getCollectivePaginate(page: number = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}collectives?page=${page}`);
  }
}
