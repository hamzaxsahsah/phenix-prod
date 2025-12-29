import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  template: `
  <mat-card style="max-width:420px; margin: 40px auto; padding:16px;">
    <h2>Admin Login</h2>
    <form (ngSubmit)="login()">
      <mat-form-field style="width:100%;">
        <mat-label>Email</mat-label>
        <input matInput [(ngModel)]="email" name="email" required />
      </mat-form-field>
      <mat-form-field style="width:100%;">
        <mat-label>Password</mat-label>
        <input matInput type="password" [(ngModel)]="password" name="password" required />
      </mat-form-field>
      <div style="margin-top:12px; text-align:right">
        <button mat-raised-button color="primary" type="submit">Login</button>
      </div>
    </form>
    <p style="margin-top:12px; font-size:12px; color:#666">Use default admin: <b>admin</b> / <b>admin</b></p>
  </mat-card>
  `
})
export class LoginComponent {
  email = 'admin';
  password = 'admin';
  constructor(private auth: AuthService, private router: Router) {}

  async login() {
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (err) {
      alert('Login failed');
    }
  }
}
