import { Injectable } from '@angular/core';
import { Ticket } from 'src/app/models/ticket';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  baseUrl = 'http://localhost:3000/';
  constructor(private http: HttpClient) {}

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.baseUrl + 'tickets').pipe(
      tap((tickets) => this.saveTicketsToLocalStorage(tickets)),
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
    return this.http.post<Ticket>(this.baseUrl + 'tickets', data).pipe(
      tap((ticket) => this.saveTicketToLocalStorage(ticket)),
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
    return this.http.put<Ticket>(`${this.baseUrl}tickets/${id}`, data).pipe(
      tap((ticket) => this.saveTicketToLocalStorage(ticket)),
      catchError((error) => {
        console.error(
          'JSON server update failed, saving ticket locally',
          error,
        );
        this.saveTicketToLocalStorage(data);
        return of(data);
      }),
    );
  }

  private getTicketsFromLocalStorage(): Ticket[] {
    const saved = localStorage.getItem('tickets');
    return saved ? JSON.parse(saved) : [];
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
}
