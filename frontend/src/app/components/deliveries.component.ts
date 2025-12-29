import { Component, OnInit } from '@angular/core';
import { DeliveryService } from '../services/delivery.service';
import { DeliverymanService } from '../services/deliveryman.service';

@Component({
  template: `
  <div>
    <mat-card>
      <mat-card-title>Create Delivery</mat-card-title>
      <mat-card-content>
        <form (ngSubmit)="create()" style="display:flex; gap:8px; flex-wrap:wrap;">
          <mat-form-field style="flex:1; min-width:220px">
            <mat-label>Client Name</mat-label>
            <input matInput placeholder="clientName" [(ngModel)]="clientName" name="clientName" required />
          </mat-form-field>
          <mat-form-field style="width:180px">
            <mat-label>Product</mat-label>
            <input matInput placeholder="product" [(ngModel)]="product" name="product" />
          </mat-form-field>
          <mat-form-field style="flex:1; min-width:220px">
            <mat-label>Address</mat-label>
            <input matInput placeholder="address" [(ngModel)]="address" name="address" required />
          </mat-form-field>
          <mat-form-field style="width:180px">
            <mat-label>Phone</mat-label>
            <input matInput placeholder="phone" [(ngModel)]="phoneNumber" name="phoneNumber" required />
          </mat-form-field>
          <mat-form-field style="width:220px">
            <mat-label>Assign To</mat-label>
            <mat-select [(ngModel)]="assignedToId" name="assignedToId">
              <mat-option [value]="undefined">-- none --</mat-option>
              <mat-option *ngFor="let dm of dms" [value]="dm.id">{{dm.email}}</mat-option>
            </mat-select>
          </mat-form-field>
          <div style="align-self:end">
            <button mat-raised-button color="primary" type="submit">Create</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>

    <mat-card style="margin-top:12px">
      <mat-card-title>Deliveries</mat-card-title>
      <mat-list>
        <mat-list-item *ngFor="let d of deliveries">
          <div style="width:100%; display:flex; gap:12px; align-items:center;">
            <div style="flex:1">
              <b>{{d.clientName}}</b> — {{d.product}} <br /> <small>{{d.address}} • {{d.phoneNumber}}</small>
            </div>
            <div style="min-width:140px">State: <strong>{{d.state}}</strong></div>
            <div><button mat-button (click)="markDelivered(d.id)">Mark Delivered</button></div>
          </div>
        </mat-list-item>
      </mat-list>
    </mat-card>
  </div>
  `
})
export class DeliveriesComponent implements OnInit {
  deliveries: any[] = [];
  dms: any[] = [];

  clientName = '';
  product = '';
  address = '';
  phoneNumber = '';
  assignedToId?: number;

  constructor(private svc: DeliveryService, private dmSvc: DeliverymanService) {}

  ngOnInit() { this.load(); this.loadDms(); }

  async load() { this.deliveries = await this.svc.list(); }
  async loadDms() { this.dms = await this.dmSvc.list(); }

  async create() {
    try {
      await this.svc.create({ clientName: this.clientName, product: this.product, address: this.address, phoneNumber: this.phoneNumber, assignedToId: this.assignedToId });
      this.clientName = this.product = this.address = this.phoneNumber = '';
      this.assignedToId = undefined;
      this.load();
    } catch (err) { alert('create failed'); }
  }

  async markDelivered(id: number) {
    await this.svc.update(id, { state: 'LIVRE' });
    this.load();
  }
}
