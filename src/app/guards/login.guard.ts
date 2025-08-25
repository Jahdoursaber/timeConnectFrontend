import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { LoginService } from '../services/user/login.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(
    private router: Router,
    private auth: LoginService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.auth.fetchUser().pipe(
      take(1),
      map(user => {
        if (user) {
         
          this.router.navigate(['/dashboard/index']);
          return false;
        }
        return true; // Autoriser la page login
      }),
      catchError(() => of(true)) // En cas d'erreur, on autorise la page login
    );
  }
}
