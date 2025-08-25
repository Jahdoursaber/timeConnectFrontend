import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  baseUrl= 'http://localhost:8000';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated1: Observable<boolean>;
  private userSub = new BehaviorSubject<User|null>(null);
  user$ = this.userSub.asObservable();
  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    this.isAuthenticated1 = this.isAuthenticatedSubject.asObservable();

  }
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  fetchUser(): Observable<User|null> {
    return this.http.get<{ user: User, roles: string[] }>(`${this.baseUrl}/api/spa/user`, { withCredentials: true })
      .pipe(
        map(response => {
        const user = { ...response.user, role: response.roles[0] }; // rôle unique
        this.userSub.next(user);
        return user;
      }),
        catchError(() => {
          this.userSub.next(null);
          return of(null);
        })
      );
  }


  private getCsrf(): Observable<void> {
    return this.http.get<void>(
      `${this.baseUrl}/sanctum/csrf-cookie`,
      { withCredentials: true }
    );
  }
  private getCookie(name: string): string | null {
    const match = document.cookie.match(
      new RegExp('(^|;\\s*)' + name + '=([^;]*)')
    );
    return match ? decodeURIComponent(match[2]) : null;
  }

  login(email: string, password: string): Observable<User> {
    return this.getCsrf().pipe(
      tap(() => console.log('CSRF Cookie récupéré')),
      switchMap(() => {
        const xsrf = this.getCookie('XSRF-TOKEN') || '';
        const headers = new HttpHeaders({
          'X-XSRF-TOKEN': xsrf,
          'Content-Type': 'application/json',
        });

        return this.http.post<{message: string; user: User}>(
          `${this.baseUrl}/api/spa/login`,
          { email, password },
          { withCredentials: true, headers });
        }),
        map(res=>res.user),
            tap(user => {
                this.currentUserSubject.next(user);
                this.isAuthenticatedSubject.next(true);
            })
    );
  }

  isAuthenticated(): boolean {
    return this.userSub.value !== null;
  }

  // logout() {
  //   return this.http.post<void>('/api/logout', {}, { withCredentials: true }).pipe(
  //     tap(() => this.currentUserSubject.next(null))
  //   );
  // }
  logout(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/spa/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.currentUserSubject.next(null);
          this.isAuthenticatedSubject.next(false);
        })
      );
  }

  changePassword(newPassword: string, newPasswordConfirmation: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/spa/change-password`, {
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation
    }).pipe(
      catchError(this.handleError)
    );
  }
  private handleError(error: HttpErrorResponse) {
    if (error.error && error.error.errors) {
      return throwError(() => error.error.errors);
    }

    if (error.error && error.error.message) {
      return throwError(() => ({
        general: [error.error.message]
      }));
    }

    if (error.error && error.error.error) {
      return throwError(() => ({
        general: [error.error.error]
      }));
    }

    return throwError(() => ({
      general: ['Une erreur est survenue. Veuillez réessayer.']
    }));
  }


}
