import { Injectable } from '@angular/core';
import { Ticket } from 'src/app/models/ticket';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  baseUrl = 'http://localhost:3000/';
  constructor(private http: HttpClient) {}

  getTickets(): Observable<Ticket[]> {
    return this.http.get<any[]>(this.baseUrl + 'tickets').pipe(
      map((tickets) =>
        tickets.map((ticket: any) => ({
          ...ticket,
          ticketId: ticket.id || ticket.ticketId,
        })),
      ),
      tap((mappedTickets) => {
        this.saveTicketsToLocalStorage(mappedTickets);
      }),
      catchError((error) => {
        console.error(
          'JSON server unavailable, loading tickets from localStorage',
          error,
        );
        return of(this.getTicketsFromLocalStorage());
      }),
    );
  }

  createTicket(data: Ticket): Observable<Ticket> {
    return this.http.post<any>(this.baseUrl + 'tickets', data).pipe(
      map((ticket: any) => ({
        ...ticket,
        ticketId: ticket.id || ticket.ticketId,
      })),
      tap((mappedTicket: any) => {
        this.saveTicketToLocalStorage(mappedTicket);
      }),
      catchError((error) => {
        console.error(
          'JSON server create failed, saving ticket locally',
          error,
        );
        const fallbackTicket = {
          ...data,
          ticketId: Date.now(),
        } as Ticket;
        this.saveTicketToLocalStorage(fallbackTicket);
        return of(fallbackTicket);
      }),
    );
  }

  updateTicket(id: number, data: Ticket): Observable<Ticket> {
    return this.http.put<any>(`${this.baseUrl}tickets/${id}`, data).pipe(
      map((ticket: any) => ({
        ...ticket,
        ticketId: ticket.id || ticket.ticketId,
      })),
      tap((mappedTicket: any) => {
        this.saveTicketToLocalStorage(mappedTicket);
      }),
      catchError((error) => {
        console.error(
          'JSON server update failed, saving ticket locally',
          error,
        );
        const mappedData = { ...data, ticketId: id };
        this.saveTicketToLocalStorage(mappedData);
        return of(mappedData);
      }),
    );
  }

  private getTicketsFromLocalStorage(): Ticket[] {
    const saved = localStorage.getItem('tickets');
    const tickets = saved ? JSON.parse(saved) : [];
    // Ensure ticketId is set
    return tickets.map((ticket: Ticket) => ({
      ...ticket,
      ticketId: ticket.ticketId,
    }));
  }

  private saveTicketsToLocalStorage(tickets: Ticket[]): void {
    localStorage.setItem('tickets', JSON.stringify(tickets));
  }

  private saveTicketToLocalStorage(ticket: Ticket): void {
    const tickets = this.getTicketsFromLocalStorage();
    const index = tickets.findIndex((t) => t.ticketId === ticket.ticketId);
    if (index > -1) {
      tickets[index] = ticket;
    } else {
      tickets.push(ticket);
    }
    this.saveTicketsToLocalStorage(tickets);
  }

  // Create a booking record
  createBooking(booking: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}bookings`, booking).pipe(
      tap((response) => {
        console.log('Booking created:', response);
      }),
      catchError((error) => {
        console.error('Failed to create booking:', error);
        return of(null);
      }),
    );
  }

  // Cancel a booking and restore seats
  cancelBooking(
    bookingId: number,
    ticketId: number,
    seatsToRestore: string[],
  ): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}bookings/${bookingId}`).pipe(
      tap(() => {
        console.log('Booking cancelled:', bookingId);
      }),
      catchError((error) => {
        console.error('Failed to cancel booking:', error);
        return of(null);
      }),
    );
  }
}
