import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService) {}

  async login(email: string, password: string) {
    const res: any = await this.api.post('/auth/login', { email, password });
    if (!res.token) throw new Error('no token');
    localStorage.setItem('jwt', res.token);
    return res;
  }

  logout() { localStorage.removeItem('jwt'); }

  get token() { return localStorage.getItem('jwt'); }

  isLogged() { return !!this.token; }
}
