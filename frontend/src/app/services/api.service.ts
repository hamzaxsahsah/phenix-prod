import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  get(path: string) { return this.http.get(this.base + path).toPromise(); }
  post(path: string, body: any) { return this.http.post(this.base + path, body).toPromise(); }
  patch(path: string, body: any) { return this.http.patch(this.base + path, body).toPromise(); }
}
