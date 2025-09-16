import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable,map } from 'rxjs';
import { Ape } from '../models/ape';

@Injectable({
  providedIn: 'root'
})
export class ApeService {
  baseUrl= environment.baseUrl;
  constructor(private http:HttpClient) { }

  getAllApes(): Observable <Ape[]> {
      return this.http.get<{apes: Ape[]}>(this.baseUrl + 'apes').pipe(
            map((res) => res.apes)
          );
    }
}
