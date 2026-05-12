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
  isSubmitting = false;

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

  initializeAvailableSeats(): void {
    const allSeats = this.generateAllSeats();
    this.availableSeats = new Set(allSeats);
  }

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

  getSeatsForRow(row: string): SeatNo[] {
    const numCols = 4;
    const seats: SeatNo[] = [];
    for (let col = 1; col <= numCols; col++) {
      seats.push(`${row}${col}` as SeatNo);
    }
    return seats;
  }

  toggleSeat(seat: SeatNo): void {
    if (this.availableSeats.has(seat)) {
      this.availableSeats.delete(seat);
    } else {
      this.availableSeats.add(seat);
    }
  }

  isSeatAvailable(seat: SeatNo): boolean {
    return this.availableSeats.has(seat);
  }

  markAllAvailable(): void {
    const allSeats = this.generateAllSeats();
    this.availableSeats = new Set(allSeats);
  }

  markAllUnavailable(): void {
    this.availableSeats.clear();
  }

  fetchTickets(): void {
    this.service
      .getTickets()
      .subscribe((res: Ticket[]) => (this.taskList = res));
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      alert('Please fill in all required fields correctly before submitting.');
      return;
    }

    this.isSubmitting = true;

    this.currentTicket.boardingPoint = this.boardingPointsInput
      .split(',')
      .map((point: string) => point.trim())
      .filter(Boolean);
    this.currentTicket.droppingPoint = this.droppingPointsInput
      .split(',')
      .map((point: string) => point.trim())
      .filter(Boolean);

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
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Ticket save error:', err);
        const message =
          err?.error?.message ||
          err?.statusText ||
          err?.message ||
          'Unable to save ticket';
        alert(`Ticket save failed: ${message}`);
        this.isSubmitting = false;
      },
    });
  }

  isFormValid(): boolean {
    if (
      !this.currentTicket.busName?.trim() ||
      this.currentTicket.busName.length < 2
    ) {
      return false;
    }
    if (!this.currentTicket.coachNo?.trim()) {
      return false;
    }
    if (
      !this.currentTicket.from?.trim() ||
      this.currentTicket.from.length < 2
    ) {
      return false;
    }
    if (!this.currentTicket.to?.trim() || this.currentTicket.to.length < 2) {
      return false;
    }
    if (!this.currentTicket.departureDate) {
      return false;
    }
    if (!this.currentTicket.departureTime) {
      return false;
    }
    if (!this.currentTicket.arrivalDate) {
      return false;
    }
    if (!this.currentTicket.arrivalTime) {
      return false;
    }
    if (!this.currentTicket.price || this.currentTicket.price <= 0) {
      return false;
    }

    if (
      this.currentTicket.from.toLowerCase() ===
      this.currentTicket.to.toLowerCase()
    ) {
      alert('Departure and destination cities cannot be the same.');
      return false;
    }

    const departureDateTime = new Date(
      `${this.currentTicket.departureDate}T${this.currentTicket.departureTime}`,
    );
    const arrivalDateTime = new Date(
      `${this.currentTicket.arrivalDate}T${this.currentTicket.arrivalTime}`,
    );

    if (arrivalDateTime <= departureDateTime) {
      alert('Arrival date and time must be after departure date and time.');
      return false;
    }

    return true;
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
