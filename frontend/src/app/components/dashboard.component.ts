import { Component } from '@angular/core';

@Component({
  template: `
  <div>
    <mat-card>
      <mat-card-title>Welcome to Pheonix Admin</mat-card-title>
      <mat-card-content>
        <p>Use the navigation above to manage deliverymen and deliveries.</p>
      </mat-card-content>
    </mat-card>
    <div style="display:flex; gap:12px; margin-top:12px">
      <mat-card style="flex:1">
        <mat-card-title>Deliverymen</mat-card-title>
        <mat-card-content>
          <p>Create and manage delivery personnel</p>
          <button mat-raised-button color="primary" routerLink="/deliverymen">Manage</button>
        </mat-card-content>
      </mat-card>
      <mat-card style="flex:1">
        <mat-card-title>Deliveries</mat-card-title>
        <mat-card-content>
          <p>View and update deliveries</p>
          <button mat-raised-button color="primary" routerLink="/deliveries">Manage</button>
        </mat-card-content>
      </mat-card>
    </div>
  </div>
  `
})
export class DashboardComponent { }
