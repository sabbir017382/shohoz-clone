import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomeComponent } from './features/home/home.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { AirComponent } from './features/air/air.component';
import { CreateTicketComponent } from './features/create-ticket/create-ticket.component';
import { TicketListComponent } from './features/ticket-list/ticket-list.component';
import { TripInfoComponent } from './features/trip-info/trip-info.component';
import { PaymentProcessComponent } from './features/payment-process/payment-process.component';
import { ProfileComponent } from './features/profile/profile.component';
import { TermsConditionsComponent } from './features/terms-conditions/terms-conditions.component';
import { AirTicketCreateComponent } from './features/air-ticket-create/air-ticket-create.component';
import { AirTicketListComponent } from './features/air-ticket-list/air-ticket-list.component';
import { AirTicketBookingComponent } from './features/air-ticket-booking/air-ticket-booking.component';
import { TicketBookingComponent } from './features/ticket-booking/ticket-booking.component';
import { UnknownFeatureComponent } from './features/unknown-feature/unknown-feature.component';
import { ContactformComponent } from './features/contactform/contactform.component';
const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'air', component: AirComponent },
  { path: 'contact', component: ContactformComponent },
  {
    path: 'air-ticket-create',
    component: AirTicketCreateComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'air-ticket-list',
    component: AirTicketListComponent,
  },
  {
    path: 'air-ticket-booking',
    component: AirTicketBookingComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'create-ticket',
    component: CreateTicketComponent,
    canActivate: [AuthGuard, AdminGuard],
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
    path: 'ticket-booking',
    component: TicketBookingComponent,
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
  { path: 'unknown', component: UnknownFeatureComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
