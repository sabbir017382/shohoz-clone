import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { BusComponent } from './vehicle/bus/bus.component';
import { AirComponent } from './vehicle/air/air.component';
import { HomeComponent } from './home/home.component';
import { CreateTicketComponent } from './create-ticket/create-ticket.component';
import { TicketListComponent } from './ticket-list/ticket-list.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    BusComponent,
    AirComponent,
    HomeComponent,
    CreateTicketComponent,
    TicketListComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class FeaturesModule {}
