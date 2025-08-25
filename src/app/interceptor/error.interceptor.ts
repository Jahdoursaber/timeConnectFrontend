
import { Router } from '@angular/router';

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable()
export class errorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
          this.router.navigate(['/login-2']);
        }

        // Renvoyer l'erreur pour le traitement dans les composants
        return throwError(() => error);
      })
    );
  }
}
