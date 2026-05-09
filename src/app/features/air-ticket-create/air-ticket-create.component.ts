import { Component, OnInit } from '@angular/core';
import {
  AirTicket,
  BusinessSeat,
  EconomySeat,
  FirstClassSeat,
  SeatType,
} from 'src/app/models/airTicket';
import { TicketService } from 'src/app/core/services/ticket.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-air-ticket-create',
  templateUrl: './air-ticket-create.component.html',
  styleUrls: ['./air-ticket-create.component.css'],
})
export class AirTicketCreateComponent implements OnInit {
  airTicketList: AirTicket[] = [];
  editMode = false;
  currentId = 0;
  boardingPointsInput = '';
  droppingPointsInput = '';
  ecseatOptions: EconomySeat[] = [];
  availableEcSeats: Set<EconomySeat> = new Set();
  bcseatOptions: BusinessSeat[] = [];
  availableBcSeats: Set<BusinessSeat> = new Set();
  fcseatOptions: FirstClassSeat[] = [];
  availableFcSeats: Set<FirstClassSeat> = new Set();
  seatPlanOpen = false;
  isSubmitting = false;

  // Seat map rows and columns
  rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  cols = [1, 2, 3, 4];

  currentTicket: AirTicket = {
    travelDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    seatType: '' as SeatType,
    baggageAllowance: '',
    priceForAdult: 0,
    priceForChild: 0,
    priceForInfant: 0,
    economySeat: '' as EconomySeat,
    businessSeat: '' as BusinessSeat,
    firstClassSeat: '' as FirstClassSeat,
    availableEcSeats: [],
    availableBcSeats: [],
    availableFcSeats: [],
    Tax: 0,
    OtherCharges: 0,
    cuponCode: '',
    insurance: false,
    processingFee: 0,
    airImageUrl: '',
    bimanName: '',
    bimanserialNo: '',
    airlineCode: '',
    from: '',
    to: '',
    boardingAirport: '',
    droppingAirport: '',
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
    // Check if form is valid
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
    // Basic required field validation
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

    // Validate that 'from' and 'to' are different
    if (
      this.currentTicket.from.toLowerCase() ===
      this.currentTicket.to.toLowerCase()
    ) {
      alert('Departure and destination cities cannot be the same.');
      return false;
    }

    // Validate date logic
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
