import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataTableService {
  constructor(private http: HttpClient) {}

  getAll<T>(endpoint: string): Observable<T[]> {
    return this.http.get<T[]>(`${environment.apiUrl}${endpoint}`);
  }

  getById<T>(endpoint: string, id: number): Observable<T> {
    return this.http.get<T>(`${environment.apiUrl}${endpoint}/${id}`);
  }

  create<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${environment.apiUrl}${endpoint}`, data);
  }

  update<T>(endpoint: string, id: number, data: any): Observable<T> {
    return this.http.put<T>(`${environment.apiUrl}${endpoint}/${id}`, data);
  }

  delete(endpoint: string, id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}${endpoint}/${id}`);
  }
}
