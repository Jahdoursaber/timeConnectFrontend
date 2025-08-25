import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class httpInterceptor implements HttpInterceptor {

  constructor(private document: Document) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Clone la requête avec withCredentials
    let newReq = req.clone({ withCredentials: true });

    // Pour les requêtes non-GET, ajouter les en-têtes CSRF
    if (req.method !== 'GET') {
      // Récupérer le token CSRF du cookie
      const token = this.getCsrfTokenFromCookie();

      newReq = newReq.clone({
        headers: newReq.headers
          .set('X-Requested-With', 'XMLHttpRequest')
          .set('X-XSRF-TOKEN', token || '')
      });
    }

    return next.handle(newReq);
  }

  // Méthode pour extraire le token CSRF du cookie
  private getCsrfTokenFromCookie(): string {
    const cookies = this.document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'XSRF-TOKEN') {
        return decodeURIComponent(value);
      }
    }
    return '';
  }
}
