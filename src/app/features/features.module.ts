import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SahredModule } from '../sahred/shared.module';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { BusComponent } from './vehicle/bus/bus.component';
import { AirComponent } from './vehicle/air/air.component';
import { HomeComponent } from './home/home.component';
import { CreateTicketComponent } from './create-ticket/create-ticket.component';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketBookingComponent } from './ticket-booking/ticket-booking.component';
import { TripInfoComponent } from './trip-info/trip-info.component';
import { PaymentProcessComponent } from './payment-process/payment-process.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    BusComponent,
    AirComponent,
    HomeComponent,
    CreateTicketComponent,
    TicketListComponent,
    TicketBookingComponent,
    TripInfoComponent,
    PaymentProcessComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule, SahredModule],
})
export class FeaturesModule {}
