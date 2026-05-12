import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SahredModule } from '../sahred/shared.module';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './home/home.component';
import { CreateTicketComponent } from './create-ticket/create-ticket.component';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketBookingComponent } from './ticket-booking/ticket-booking.component';
import { TripInfoComponent } from './trip-info/trip-info.component';
import { PaymentProcessComponent } from './payment-process/payment-process.component';
import { ProfileComponent } from './profile/profile.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { AirComponent } from './air/air.component';
import { AirTicketCreateComponent } from './air-ticket-create/air-ticket-create.component';
import { AirTicketListComponent } from './air-ticket-list/air-ticket-list.component';
import { AirTicketBookingComponent } from './air-ticket-booking/air-ticket-booking.component';
import { UnknownFeatureComponent } from './unknown-feature/unknown-feature.component';
import { ContactformComponent } from './contactform/contactform.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,

    HomeComponent,
    CreateTicketComponent,
    TicketListComponent,
    TicketBookingComponent,
    TripInfoComponent,
    PaymentProcessComponent,
    ProfileComponent,
    TermsConditionsComponent,
    AirComponent,
    AirTicketCreateComponent,
    AirTicketListComponent,
    AirTicketBookingComponent,
    UnknownFeatureComponent,
    ContactformComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SahredModule,
  ],
})
export class FeaturesModule {}
