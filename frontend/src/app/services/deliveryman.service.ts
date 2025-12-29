import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DeliverymanService {
  constructor(private api: ApiService) {}
  list() { return this.api.get('/deliverymen') as Promise<any[]>; }
  create(email: string, password: string) { return this.api.post('/deliverymen', { email, password }); }
}
