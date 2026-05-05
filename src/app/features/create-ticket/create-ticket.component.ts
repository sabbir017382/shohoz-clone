import { Component, OnInit } from '@angular/core';
import { Ticket, SeatNo } from 'src/app/models/ticket';
import { TicketService } from 'src/app/core/services/ticket.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.component.html',
  styleUrls: ['./create-ticket.component.css'],
})
export class CreateTicketComponent implements OnInit {
  taskList: Ticket[] = [];
  editMode = false;
  currentId = 0;
  boardingPointsInput = '';
  droppingPointsInput = '';
  seatOptions: SeatNo[] = [];
  availableSeats: Set<SeatNo> = new Set();
  seatPlanOpen = false;

  // Seat map rows and columns
  rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  cols = [1, 2, 3, 4];

  currentTicket: Ticket = {
    busName: '',
    coachNo: '',
    from: '',
    to: '',
    boardingPoint: [],
    droppingPoint: [],
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    seatNo: '' as SeatNo,
    price: 0,
    availableSeats: [],
  };

  constructor(
    private service: TicketService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.fetchTickets();
    this.initializeAvailableSeats();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.currentId = +id;
      this.service.getTickets().subscribe((tickets: Ticket[]) => {
        const ticket = tickets.find(
          (specificTicket: Ticket) =>
            specificTicket.ticketId === this.currentId,
        );
        if (ticket) {
          this.currentTicket = { ...ticket };
          this.boardingPointsInput = ticket.boardingPoint.join(', ');
          this.droppingPointsInput = ticket.droppingPoint.join(', ');
          if (ticket.availableSeats) {
            this.availableSeats = new Set(ticket.availableSeats);
          }
        }
      });
    }
  }

  // Initialize all seats as available by default
  initializeAvailableSeats(): void {
    const allSeats = this.generateAllSeats();
    this.availableSeats = new Set(allSeats);
  }

  // Generate all possible seats
  generateAllSeats(): SeatNo[] {
    const seats: SeatNo[] = [];
    for (const row of this.rows) {
      const numCols = 4;
      for (let col = 1; col <= numCols; col++) {
        seats.push(`${row}${col}` as SeatNo);
      }
    }
    return seats;
  }

  // Get seats for a specific row
  getSeatsForRow(row: string): SeatNo[] {
    const numCols = 4;
    const seats: SeatNo[] = [];
    for (let col = 1; col <= numCols; col++) {
      seats.push(`${row}${col}` as SeatNo);
    }
    return seats;
  }

  // Toggle seat availability
  toggleSeat(seat: SeatNo): void {
    if (this.availableSeats.has(seat)) {
      this.availableSeats.delete(seat);
    } else {
      this.availableSeats.add(seat);
    }
  }

  // Check if seat is available
  isSeatAvailable(seat: SeatNo): boolean {
    return this.availableSeats.has(seat);
  }

  // Mark all seats as available
  markAllAvailable(): void {
    const allSeats = this.generateAllSeats();
    this.availableSeats = new Set(allSeats);
  }

  // Mark all seats as unavailable
  markAllUnavailable(): void {
    this.availableSeats.clear();
  }

  fetchTickets(): void {
    this.service
      .getTickets()
      .subscribe((res: Ticket[]) => (this.taskList = res));
  }

  onSubmit(): void {
    this.currentTicket.boardingPoint = this.boardingPointsInput
      .split(',')
      .map((point: string) => point.trim())
      .filter(Boolean);
    this.currentTicket.droppingPoint = this.droppingPointsInput
      .split(',')
      .map((point: string) => point.trim())
      .filter(Boolean);

    // Save available seats
    this.currentTicket.availableSeats = Array.from(this.availableSeats);

    const action = this.editMode
      ? this.service.updateTicket(this.currentId, this.currentTicket)
      : this.service.createTicket(this.currentTicket);

    action.subscribe({
      next: () => {
        this.fetchTickets();
        this.resetForm();
        alert(
          this.editMode
            ? 'Ticket updated successfully'
            : 'Ticket added successfully',
        );
      },
      error: (err) => {
        console.error('Ticket save error:', err);
        const message =
          err?.error?.message ||
          err?.statusText ||
          err?.message ||
          'Unable to save ticket';
        alert(`Ticket save failed: ${message}`);
      },
    });
  }

  resetForm(): void {
    this.editMode = false;
    this.currentId = 0;
    this.boardingPointsInput = '';
    this.droppingPointsInput = '';
    this.currentTicket = {
      busName: '',
      coachNo: '',
      from: '',
      to: '',
      boardingPoint: [],
      droppingPoint: [],
      departureDate: '',
      departureTime: '',
      arrivalDate: '',
      arrivalTime: '',
      seatNo: '' as SeatNo,
      price: 0,
      availableSeats: [],
    };
    this.initializeAvailableSeats();
  }
}
