import {
  Component,
  OnChanges,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { Ticket, SeatNo } from 'src/app/models/ticket';
import { TicketService } from 'src/app/core/services/ticket.service';

@Component({
  selector: 'app-ticket-booking',
  templateUrl: './ticket-booking.component.html',
  styleUrls: ['./ticket-booking.component.css'],
})
export class TicketBookingComponent implements OnInit, OnChanges {
  @Input() ticket: Ticket | null = null;
  @Output() closePanel = new EventEmitter<void>();
  boardingPoints: any[] = []; //for multiple boading point

  selectedSeats: SeatNo[] = [];
  totalAmount: number = 0;
  step: number = 1; // 1: ticket info & seat selection, 2: boarding points, 3: confirmation
  bookedSeats: SeatNo[] = []; // Track seats booked in current session
  originalAvailableSeats: SeatNo[] = []; // Store original available seats
  bookingId: number | null = null; // Track the booking record ID

  // Seat map
  rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  cols = [1, 2, 3, 4];

  selectedBoardingPoint: string = '';

  // it's for active tag
  activeTab: string = 'seats';

  setTab(tab: string) {
    this.activeTab = tab;
  }

  constructor(
    private ticketService: TicketService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.ticket) {
      this.generateBoardingPoints();
      if (this.ticket.availableSeats) {
        this.originalAvailableSeats = [...this.ticket.availableSeats];
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticket']?.currentValue && this.ticket) {
      this.generateBoardingPoints();
      if (this.ticket.availableSeats) {
        this.originalAvailableSeats = [...this.ticket.availableSeats];
      }
    }
  }

  //for boarding points
  generateBoardingPoints() {
    const boardingList = this.ticket?.boardingPoint ?? [];
    const baseTime = new Date();
    baseTime.setHours(21, 0, 0); // 09:00 PM

    this.boardingPoints = boardingList.map((name, i) => {
      const time = new Date(baseTime.getTime() + i * 15 * 60000);

      return {
        name,
        location: 'DHAKA',
        time: this.formatAMPM(time),
      };
    });
  }

  formatAMPM(date: Date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const min = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${min} ${ampm}`;
  }

  // Get seats for a specific row
  getSeatsForRow(row: string): SeatNo[] {
    const seats: SeatNo[] = [];
    for (let col = 1; col <= this.cols.length; col++) {
      seats.push(`${row}${col}` as SeatNo);
    }
    return seats;
  }

  // Check if seat is available
  isSeatAvailable(seat: SeatNo): boolean {
    return this.ticket?.availableSeats?.includes(seat) ?? false;
  }

  // Check if seat is booked
  isSeatBooked(seat: SeatNo): boolean {
    const allSeats = this.generateAllSeats();
    const isAvailable = this.ticket?.availableSeats?.includes(seat) ?? false;
    return !isAvailable && allSeats.includes(seat);
  }

  // Generate all possible seats
  generateAllSeats(): SeatNo[] {
    const seats: SeatNo[] = [];
    for (const row of this.rows) {
      for (let col = 1; col <= this.cols.length; col++) {
        seats.push(`${row}${col}` as SeatNo);
      }
    }
    return seats;
  }

  // Check if seat is selected
  isSeatSelected(seat: SeatNo): boolean {
    return this.selectedSeats.includes(seat);
  }

  // Toggle seat selection
  toggleSeat(seat: SeatNo): void {
    if (!this.isSeatAvailable(seat)) return;

    const index = this.selectedSeats.indexOf(seat);
    if (index > -1) {
      this.selectedSeats.splice(index, 1);
    } else {
      if (this.selectedSeats.length < 4) {
        this.selectedSeats.push(seat);
      }
    }
    this.calculateTotal();
  }

  // Calculate total amount
  calculateTotal(): void {
    this.totalAmount = this.selectedSeats.length * (this.ticket?.price ?? 0);
  }

  // Proceed to boarding points
  continueToBoarding(): void {
    if (this.selectedSeats.length > 0) {
      this.step = 2;
    }
  }

  // Select boarding point and continue
  selectBoardingPoint(point: string): void {
    this.selectedBoardingPoint = point;
  }

  continueToConfirmation(): void {
    if (this.selectedBoardingPoint) {
      this.step = 3;
    }
  }

  saveSelectedTicket(): void {
    if (!this.ticket) {
      return;
    }

    const ticketWithSeats = {
      ...this.ticket,
      seatNo: this.selectedSeats[0] as SeatNo,
      selectedSeats: [...this.selectedSeats],
      totalAmount: this.totalAmount,
    } as Ticket & { selectedSeats: string[]; totalAmount: number };

    this.ticketService.setSelectedTicket(ticketWithSeats);
  }

  goToTripInfo(): void {
    this.saveSelectedTicket();
    this.router.navigate(['/trip-info']);
  }

  // Confirm booking
  confirmBooking(): void {
    console.log('Confirm booking clicked');
    console.log('Ticket:', this.ticket);
    console.log('Selected seats:', this.selectedSeats);

    if (!this.ticket) {
      alert('Ticket not found');
      return;
    }

    if (!this.ticket.ticketId) {
      console.error('Ticket ID is missing:', this.ticket);
      alert('Error: Ticket ID not found');
      return;
    }

    // Store the booked seats for potential cancellation
    this.bookedSeats = [...this.selectedSeats];

    // Remove selected seats from availableSeats
    const updatedAvailableSeats =
      this.ticket.availableSeats?.filter(
        (seat) => !this.selectedSeats.includes(seat),
      ) || [];

    // Update ticket with new available seats
    const updatedTicket = {
      ...this.ticket,
      availableSeats: updatedAvailableSeats,
    };

    console.log('Updated ticket:', updatedTicket);

    // First, update the ticket
    this.ticketService
      .updateTicket(this.ticket.ticketId, updatedTicket)
      .subscribe(
        (response) => {
          // Then create a booking record in the JSON server
          const bookingData = {
            ticketId: this.ticket!.ticketId,
            busName: this.ticket!.busName,
            bookedSeats: this.selectedSeats,
            boardingPoint: this.selectedBoardingPoint,
            totalAmount: this.totalAmount,
            bookingDate: new Date().toISOString(),
          };

          this.ticketService.createBooking(bookingData).subscribe(
            (bookingResponse) => {
              if (bookingResponse) {
                this.bookingId = bookingResponse.id;
              }
              console.log('Booking confirmed:', bookingResponse);
              // Set selected ticket with booked seat info
              const ticketWithSeats = {
                ...updatedTicket,
                seatNo: this.selectedSeats[0] as SeatNo,
                selectedSeats: [...this.selectedSeats],
              } as Ticket & { selectedSeats: string[] };
              this.ticketService.setSelectedTicket(ticketWithSeats);
              // Navigate to trip-info
              this.router.navigate(['/trip-info']);
            },
            (error) => {
              console.error('Failed to create booking record:', error);
              // Still navigate even if booking record creation failed
              const ticketWithSeats = {
                ...updatedTicket,
                seatNo: this.selectedSeats[0] as SeatNo,
                selectedSeats: [...this.selectedSeats],
              } as Ticket & { selectedSeats: string[] };
              this.ticketService.setSelectedTicket(ticketWithSeats);
              this.router.navigate(['/trip-info']);
            },
          );
        },
        (error) => {
          console.error('Booking failed:', error);
          alert('Booking failed. Please try again.');
        },
      );
  }

  // Cancel booking
  cancelBooking(): void {
    if (!this.ticket || !this.ticket.ticketId) {
      alert('Cannot cancel: Ticket not found');
      return;
    }

    if (this.bookedSeats.length === 0) {
      alert('No booking to cancel');
      return;
    }

    // Restore booked seats back to available list
    const restoredAvailableSeats = [
      ...(this.ticket.availableSeats || []),
      ...this.bookedSeats,
    ];

    // Remove duplicates and sort
    const uniqueSeats = Array.from(new Set(restoredAvailableSeats));

    // Update ticket with restored available seats
    const updatedTicket = {
      ...this.ticket,
      availableSeats: uniqueSeats as SeatNo[],
    };

    console.log('Cancelling booking. Restored seats:', this.bookedSeats);

    // First delete the booking record if it exists
    if (this.bookingId) {
      this.ticketService
        .cancelBooking(this.bookingId, this.ticket!.ticketId!, this.bookedSeats)
        .subscribe(
          () => {
            // Then update the ticket to restore seats
            this.ticketService
              .updateTicket(this.ticket!.ticketId!, updatedTicket)
              .subscribe(
                (response) => {
                  console.log('Booking cancelled:', response);
                  alert(
                    `Booking cancelled! Seats released: ${this.bookedSeats.join(', ')}`,
                  );
                  this.bookedSeats = [];
                  this.selectedSeats = [];
                  this.step = 1;
                  this.selectedBoardingPoint = '';
                  this.bookingId = null;
                  this.closePanel.emit();
                },
                (error) => {
                  console.error('Failed to restore seats:', error);
                  alert('Failed to restore seats. Please try again.');
                },
              );
          },
          (error) => {
            console.error('Failed to delete booking record:', error);
            alert('Failed to cancel booking. Please try again.');
          },
        );
    } else {
      // No booking record, just restore seats
      this.ticketService
        .updateTicket(this.ticket!.ticketId!, updatedTicket)
        .subscribe(
          (response) => {
            console.log('Booking cancelled:', response);
            alert(
              `Booking cancelled! Seats released: ${this.bookedSeats.join(', ')}`,
            );
            this.bookedSeats = [];
            this.selectedSeats = [];
            this.step = 1;
            this.selectedBoardingPoint = '';
            this.bookingId = null;
            this.closePanel.emit();
          },
          (error) => {
            console.error('Cancellation failed:', error);
            alert('Cancellation failed. Please try again.');
          },
        );
    }
  }

  // Go back
  goBack(): void {
    if (this.step > 1) {
      this.step--;
    } else {
      // If there are booked seats, ask user if they want to cancel
      if (this.bookedSeats.length > 0) {
        const confirmCancel = confirm(
          'You have booked seats. Do you want to cancel the booking?',
        );
        if (confirmCancel) {
          this.cancelBooking();
        }
      } else {
        this.closePanel.emit();
      }
    }
  }
}
