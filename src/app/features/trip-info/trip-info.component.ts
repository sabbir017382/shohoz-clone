import { Component, OnInit } from '@angular/core';
import { Ticket, SeatNo } from 'src/app/models/ticket';
import { User } from 'src/app/models/user';
import { TicketService } from 'src/app/core/services/ticket.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trip-info',
  templateUrl: './trip-info.component.html',
  styleUrls: ['./trip-info.component.css'],
})
export class TripInfoComponent implements OnInit {
  user: User | null = null;
  ticket: Ticket | null = null;

  constructor(
    private service: TicketService,
    private auth: AuthService,
    private router: Router,
  ) {}

  selectedSeats: string[] = [];
  totalAmount: number = 0;

  ngOnInit(): void {
    this.user = this.fetchUser();
    this.ticket = this.fetchTicket();
  }

  fetchUser(): User | null {
    const userData = this.auth.getUser();
    if (userData) {
      return userData;
    } else {
      this.router.navigate(['/login']);
      return null;
    }
  }

  calculateTotal(): void {
    this.totalAmount = this.selectedSeats.length * (this.ticket?.price ?? 0);
  }

  fetchTicket(): Ticket | null {
    const ticketData = this.service.getSelectedTicket();
    if (ticketData) {
      this.ticket = ticketData;
      const selectedSeatsFromStorage = (
        ticketData as Ticket & { selectedSeats?: string[] }
      ).selectedSeats;
      if (
        Array.isArray(selectedSeatsFromStorage) &&
        selectedSeatsFromStorage.length
      ) {
        this.selectedSeats = selectedSeatsFromStorage;
      } else {
        const seatValue = String(ticketData.seatNo || '');
        this.selectedSeats = seatValue
          .split(',')
          .map((seat) => seat.trim())
          .filter((seat) => seat.length > 0);
      }
      this.calculateTotal();
      return ticketData;
    } else {
      return null;
    }
  }

  saveUserInfo(): void {
    if (this.user) {
      this.auth.updateUser(this.user);
      alert('User information updated successfully!');
    }
  }

  proceedToPayment(): void {
    localStorage.setItem('paymentTotal', String(this.totalAmount));
    this.router.navigate(['/payment']);
  }
}
