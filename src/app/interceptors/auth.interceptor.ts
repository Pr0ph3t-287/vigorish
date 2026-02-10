import { HttpInterceptorFn, HttpErrorResponse, HttpEvent, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // Skip auth for these endpoints
  const excludedUrls = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];
  const isExcluded = excludedUrls.some(url => req.url.includes(url));

  if (isExcluded) {
    return next(req);
  }

  // Add access token to request
  const accessToken = authService.getAccessToken();
  if (accessToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If we get a 401 and have a refresh token, try to refresh
      if (error.status === 401 && authService.getRefreshToken()) {
        return handleTokenRefresh(authService, req, next);
      }

      return throwError(() => error);
    })
  );
};

function handleTokenRefresh(
  authService: AuthService,
  req: HttpRequest<unknown>,
  next: any
): Observable<HttpEvent<unknown>> {
  const accessToken = authService.getAccessToken();
  const refreshToken = authService.getRefreshToken();

  if (!accessToken || !refreshToken) {
    authService.logout();
    return throwError(() => new Error('No tokens available'));
  }

  return authService.refreshToken({ accessToken, refreshToken }).pipe(
    switchMap((): Observable<HttpEvent<unknown>> => {
      // Retry the original request with new token
      const newAccessToken = authService.getAccessToken();
      if (newAccessToken) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newAccessToken}`
          }
        });
      }
      return next(req);
    }),
    catchError((error) => {
      // If refresh fails, logout user
      authService.logout();
      return throwError(() => error);
    })
  );
}
