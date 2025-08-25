import { CanActivateFn } from '@angular/router';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { LoginService } from '../services/user/login.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const allowedRoles = route.data['roles'] as string[];

    return this.loginService.user$.pipe(
      map(user => {
        if (user && allowedRoles.includes(user.role)) {
          return true;
        } else {
          this.router.navigate(['/error-404']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/error-404']);
        return of(false);
      })
    );
  }
}

