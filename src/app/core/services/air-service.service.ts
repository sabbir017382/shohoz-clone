import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';

import { catchError, map, tap } from 'rxjs/operators';

import { AirTicket } from 'src/app/models/airTicket';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AirServiceService {
  baseUrl = environment.apiUrl + '/';

  constructor(private http: HttpClient) {}

  // =========================
  // GET ALL TICKETS
  // =========================

  getTickets(): Observable<AirTicket[]> {
    return this.http.get<AirTicket[]>(`${this.baseUrl}airTickets`).pipe(
      map((tickets: AirTicket[]) =>
        tickets.map((ticket: AirTicket) => ({
          ...ticket,

          ticketId: ticket.ticketId ?? 0,
        })),
      ),

      tap((tickets: AirTicket[]) => {
        this.saveTicketsToLocalStorage(tickets);
      }),

      catchError((error) => {
        console.error('Server unavailable', error);

        return of(this.getTicketsFromLocalStorage());
      }),
    );
  }

  // =========================
  // CREATE
  // =========================

  createTicket(data: AirTicket): Observable<AirTicket> {
    return this.http.post<AirTicket>(`${this.baseUrl}airTickets`, data).pipe(
      map((ticket: AirTicket) => ({
        ...ticket,

        ticketId: ticket.ticketId ?? Date.now(),
      })),

      tap((ticket: AirTicket) => {
        this.saveTicketToLocalStorage(ticket);
      }),

      catchError((error) => {
        console.error('Create failed', error);

        const fallbackTicket: AirTicket = {
          ...data,

          ticketId: Date.now(),
        };

        this.saveTicketToLocalStorage(fallbackTicket);

        return of(fallbackTicket);
      }),
    );
  }

  // =========================
  // UPDATE
  // =========================

  updateTicket(id: number, data: AirTicket): Observable<AirTicket> {
    return this.http
      .put<AirTicket>(`${this.baseUrl}airTickets/${id}`, data)
      .pipe(
        map((ticket: AirTicket) => ({
          ...ticket,

          ticketId: id,
        })),

        tap((ticket: AirTicket) => {
          this.saveTicketToLocalStorage(ticket);
        }),

        catchError((error) => {
          console.error('Update failed', error);

          const fallbackTicket: AirTicket = {
            ...data,

            ticketId: id,
          };

          this.saveTicketToLocalStorage(fallbackTicket);

          return of(fallbackTicket);
        }),
      );
  }

  // =========================
  // DELETE
  // =========================

  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}airTickets/${id}`).pipe(
      tap(() => {
        const tickets = this.getTicketsFromLocalStorage().filter(
          (ticket: AirTicket) => ticket.ticketId !== id,
        );

        this.saveTicketsToLocalStorage(tickets);
      }),

      catchError((error) => {
        console.error('Delete failed', error);

        const tickets = this.getTicketsFromLocalStorage().filter(
          (ticket: AirTicket) => ticket.ticketId !== id,
        );

        this.saveTicketsToLocalStorage(tickets);

        return of(void 0);
      }),
    );
  }

  // =========================
  // LOCAL STORAGE
  // =========================

  private getTicketsFromLocalStorage(): AirTicket[] {
    const saved = localStorage.getItem('airTickets');

    return saved ? JSON.parse(saved) : [];
  }

  private saveTicketsToLocalStorage(tickets: AirTicket[]): void {
    localStorage.setItem('airTickets', JSON.stringify(tickets));
  }

  private saveTicketToLocalStorage(ticket: AirTicket): void {
    const tickets = this.getTicketsFromLocalStorage();

    const index = tickets.findIndex(
      (t: AirTicket) => t.ticketId === ticket.ticketId,
    );

    if (index > -1) {
      tickets[index] = ticket;
    } else {
      tickets.push(ticket);
    }

    this.saveTicketsToLocalStorage(tickets);
  }

  // =========================
  // SELECTED TICKET
  // =========================

  setSelectedTicket(ticket: AirTicket): void {
    localStorage.setItem('selectedAirTicket', JSON.stringify(ticket));
    localStorage.removeItem('selectedTicket');
  }

  getSelectedTicket(): AirTicket | null {
    const ticket = localStorage.getItem('selectedAirTicket');

    return ticket ? JSON.parse(ticket) : null;
  }
}
