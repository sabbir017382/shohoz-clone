import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomeComponent } from './features/home/home.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AirComponent } from './features/air/air.component';
import { CreateTicketComponent } from './features/create-ticket/create-ticket.component';
import { TicketListComponent } from './features/ticket-list/ticket-list.component';
import { TripInfoComponent } from './features/trip-info/trip-info.component';
import { PaymentProcessComponent } from './features/payment-process/payment-process.component';
import { ProfileComponent } from './features/profile/profile.component';
import { TermsConditionsComponent } from './features/terms-conditions/terms-conditions.component';
const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'air', component: AirComponent },
  {
    path: 'create-ticket',
    component: CreateTicketComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'ticket-list',
    component: TicketListComponent,
  },
  {
    path: 'trip-info',
    component: TripInfoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'payment',
    component: PaymentProcessComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  { path: 'terms-conditions', component: TermsConditionsComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
