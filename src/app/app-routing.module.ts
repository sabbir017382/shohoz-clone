import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { BusComponent } from './features/vehicle/bus/bus.component';
import { AirComponent } from './features/vehicle/air/air.component';
import { HomeComponent } from './features/home/home.component';
import { AuthGuard } from './core/guards/auth.guard';
import { CreateTicketComponent } from './features/create-ticket/create-ticket.component';
import { TicketListComponent } from './features/ticket-list/ticket-list.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'bus', component: BusComponent },
  { path: 'air', component: AirComponent },
  { path: 'create-ticket', component: CreateTicketComponent },
  { path: 'ticket-list', component: TicketListComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
