import { Component, OnInit } from '@angular/core';
import { DeliverymanService } from '../services/deliveryman.service';

@Component({
  template: `
  <div>
    <mat-card>
      <mat-card-title>Deliverymen</mat-card-title>
      <mat-card-content>
        <form (ngSubmit)="create()" style="display:flex; gap:8px; align-items:center;">
          <mat-form-field style="flex:1;">
            <mat-label>Email</mat-label>
            <input matInput placeholder="email" [(ngModel)]="email" name="email" required />
          </mat-form-field>
          <mat-form-field style="width:160px;">
            <mat-label>Password</mat-label>
            <input matInput placeholder="password" [(ngModel)]="password" name="password" required />
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit">Create</button>
        </form>
      </mat-card-content>
    </mat-card>

    <mat-card style="margin-top:12px">
      <mat-list>
        <mat-list-item *ngFor="let u of users">{{u.email}} <span style="flex:1 1 auto"></span> <small>id: {{u.id}}</small></mat-list-item>
      </mat-list>
    </mat-card>
  </div>
  `
})
export class DeliverymenComponent implements OnInit {
  users: any[] = [];
  email = '';
  password = '';
  constructor(private svc: DeliverymanService) {}

  ngOnInit() { this.load(); }
  async load() { this.users = await this.svc.list(); }
  async create() {
    try {
      await this.svc.create(this.email, this.password);
      this.email = this.password = '';
      this.load();
    } catch (err) { alert('create failed'); }
  }
}
