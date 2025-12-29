import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
  <mat-toolbar color="primary">
    <span>Pheonix Admin</span>
    <span style="flex:1 1 auto"></span>
    <button mat-button routerLink="/dashboard">Dashboard</button>
    <button mat-button routerLink="/deliverymen">Deliverymen</button>
    <button mat-button routerLink="/deliveries">Deliveries</button>
    <button mat-button routerLink="/login">Logout</button>
  </mat-toolbar>
  <div style="padding:20px; max-width:1100px; margin: 0 auto;">
    <router-outlet></router-outlet>
  </div>
  `
})
export class AppComponent { }
