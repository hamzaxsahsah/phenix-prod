import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  constructor(private api: ApiService) {}

  list() { return this.api.get('/deliveries') as Promise<any[]>; }
  create(data: any) { return this.api.post('/deliveries', data); }
  update(id: number, data: any) { return this.api.patch(`/deliveries/${id}`, data); }
}
