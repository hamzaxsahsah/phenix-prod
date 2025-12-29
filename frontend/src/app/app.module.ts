import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login.component';
import { DashboardComponent } from './components/dashboard.component';
import { DeliverymenComponent } from './components/deliverymen.component';
import { DeliveriesComponent } from './components/deliveries.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { MaterialModule } from './material.module';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'deliverymen', component: DeliverymenComponent },
  { path: 'deliveries', component: DeliveriesComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  declarations: [AppComponent, LoginComponent, DashboardComponent, DeliverymenComponent, DeliveriesComponent],
  imports: [BrowserModule, BrowserAnimationsModule, MaterialModule, FormsModule, ReactiveFormsModule, HttpClientModule, RouterModule.forRoot(routes)],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
