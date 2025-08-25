import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { LoginService } from '../services/user/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private auth: LoginService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {


    // Sinon on va interroger /api/user AVANT de statuer
    return this.auth.fetchUser().pipe(
      map(user => {
        console.warn('=>>',user)
        if (user) {
          return true;
        }
        this.router.navigate(['/login-2']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/login-2']);
        return of(false);
      })
    );
  }
}
