import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  private readonly baseUrl = 'http://16.16.90.232:9090/api/system';

  constructor(private http: HttpClient) { }

  healthCheck(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }

  initializeRoles(): Observable<any> {
    return this.http.post(`${this.baseUrl}/init-roles`, {});
  }
}