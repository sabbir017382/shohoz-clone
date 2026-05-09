import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

import {
  AirTicket,
  EconomySeat,
  BusinessSeat,
  FirstClassSeat,
  SeatType,
} from 'src/app/models/airTicket';

import { AirServiceService } from 'src/app/core/services/air-service.service';

@Component({
  selector: 'app-air-ticket-create',
  templateUrl: './air-ticket-create.component.html',
  styleUrls: ['./air-ticket-create.component.css'],
})
export class AirTicketCreateComponent implements OnInit {
  editMode = false;
  isSubmitting = false;
  seatPlanOpen = false;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  selectedClass: 'Economy' | 'Business' | 'First' = 'Economy';

  // =====================
  // SEAT OPTIONS
  // =====================

  ecseatOptions: EconomySeat[] = [
    'A1',
    'A2',
    'A3',
    'A4',
    'B1',
    'B2',
    'B3',
    'B4',
    'C1',
    'C2',
    'C3',
    'C4',
    'D1',
    'D2',
    'D3',
    'D4',
  ];

  bcseatOptions: BusinessSeat[] = [
    'E1',
    'E2',
    'E3',
    'E4',
    'F1',
    'F2',
    'F3',
    'F4',
    'G1',
    'G2',
    'G3',
    'G4',
  ];

  fcseatOptions: FirstClassSeat[] = [
    'H1',
    'H2',
    'H3',
    'H4',
    'I1',
    'I2',
    'I3',
    'I4',
    'J1',
    'J2',
    'J3',
    'J4',
  ];

  // =====================
  // AVAILABLE SEATS
  // =====================

  availableEcSeats = new Set<EconomySeat>();
  availableBcSeats = new Set<BusinessSeat>();
  availableFcSeats = new Set<FirstClassSeat>();

  // =====================
  // MAIN OBJECT
  // =====================

  currentAirTicket: AirTicket = this.getDefaultTicket();

  constructor(
    private service: AirServiceService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {}

  // =====================
  // IMAGE UPLOAD
  // =====================

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      this.currentAirTicket.airImageUrl = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  // =====================
  // PLANE SEAT GENERATOR
  // =====================

  getRows(): string[] {
    if (this.selectedClass === 'Economy') return ['A', 'B', 'C', 'D'];
    if (this.selectedClass === 'Business') return ['E', 'F', 'G'];
    return ['H', 'I', 'J'];
  }

  getSeats(row: string, side: 'left' | 'right'): string[] {
    return side === 'left' ? [`${row}1`, `${row}2`] : [`${row}3`, `${row}4`];
  }

  // =====================
  // TOGGLE SEAT
  // =====================

  toggleSeat(seat: string): void {
    if (this.selectedClass === 'Economy') {
      this.availableEcSeats.has(seat as EconomySeat)
        ? this.availableEcSeats.delete(seat as EconomySeat)
        : this.availableEcSeats.add(seat as EconomySeat);
    }

    if (this.selectedClass === 'Business') {
      this.availableBcSeats.has(seat as BusinessSeat)
        ? this.availableBcSeats.delete(seat as BusinessSeat)
        : this.availableBcSeats.add(seat as BusinessSeat);
    }

    if (this.selectedClass === 'First') {
      this.availableFcSeats.has(seat as FirstClassSeat)
        ? this.availableFcSeats.delete(seat as FirstClassSeat)
        : this.availableFcSeats.add(seat as FirstClassSeat);
    }
  }

  // =====================
  // CHECK AVAILABLE
  // =====================

  isAvailable(seat: string): boolean {
    if (this.selectedClass === 'Economy') {
      return this.availableEcSeats.has(seat as EconomySeat);
    }

    if (this.selectedClass === 'Business') {
      return this.availableBcSeats.has(seat as BusinessSeat);
    }

    return this.availableFcSeats.has(seat as FirstClassSeat);
  }

  // =====================
  // MARK ALL AVAILABLE
  // =====================

  getCurrentSeats(): string[] {
    if (this.selectedClass === 'Economy') return this.ecseatOptions;
    if (this.selectedClass === 'Business') return this.bcseatOptions;
    return this.fcseatOptions;
  }

  markAllAvailable(): void {
    const currentSeats = this.getCurrentSeats();

    currentSeats.forEach((seat) => {
      if (this.selectedClass === 'Economy') {
        this.availableEcSeats.add(seat as EconomySeat);
      }

      if (this.selectedClass === 'Business') {
        this.availableBcSeats.add(seat as BusinessSeat);
      }

      if (this.selectedClass === 'First') {
        this.availableFcSeats.add(seat as FirstClassSeat);
      }
    });
  }

  // =====================
  // MARK ALL UNAVAILABLE
  // =====================

  markAllUnavailable(): void {
    if (this.selectedClass === 'Economy') {
      this.availableEcSeats.clear();
    }

    if (this.selectedClass === 'Business') {
      this.availableBcSeats.clear();
    }

    if (this.selectedClass === 'First') {
      this.availableFcSeats.clear();
    }
  }

  // =====================
  // ALL SEATS
  // =====================

  getAllSeats(): string[] {
    const seats: string[] = [];

    this.getRows().forEach((row) => {
      seats.push(`${row}1`, `${row}2`, `${row}3`, `${row}4`);
    });

    return seats;
  }

  getDefaultTicket(): AirTicket {
    return {
      bimanName: '',
      bimanserialNo: '',
      airlineCode: '',
      from: '',
      to: '',
      boardingAirport: '',
      droppingAirport: '',
      travelDate: '',
      departureTime: '',
      arrivalDate: '',
      arrivalTime: '',

      seatType: 'EconomyClass',

      baggageAllowance: '',
      priceForAdult: 0,
      priceForChild: 0,
      priceForInfant: 0,

      economySeat: 'A1',
      businessSeat: 'E1',
      firstClassSeat: 'H1',

      Tax: 0,
      OtherCharges: 0,
      insurance: false,
      processingFee: 0,
      airImageUrl: '',
      cuponCode: '',
    } as AirTicket;
  }

  resetSeatSelection(): void {
    this.availableEcSeats.clear();
    this.availableBcSeats.clear();
    this.availableFcSeats.clear();
    this.selectedClass = 'Economy';
    this.seatPlanOpen = false;
  }

  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  // =====================
  // SUBMIT
  // =====================

  submitTicket(form: NgForm): void {
    if (!form.valid) {
      this.showToastMessage(
        'Please fill all required fields correctly.',
        'error',
      );
      return;
    }

    this.isSubmitting = true;

    this.currentAirTicket.availableEcSeats = Array.from(this.availableEcSeats);
    this.currentAirTicket.availableBcSeats = Array.from(this.availableBcSeats);
    this.currentAirTicket.availableFcSeats = Array.from(this.availableFcSeats);

    this.currentAirTicket.seatType =
      this.selectedClass === 'Economy'
        ? 'EconomyClass'
        : this.selectedClass === 'Business'
          ? 'BusinessClass'
          : 'FirstClass';

    if (this.editMode) {
      this.service
        .updateTicket(this.currentAirTicket.ticketId!, this.currentAirTicket)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.showToastMessage('Ticket updated successfully.', 'success');
          },
          error: () => {
            this.isSubmitting = false;
            this.showToastMessage('Ticket update failed. Try again.', 'error');
          },
        });
    } else {
      this.service.createTicket(this.currentAirTicket).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.showToastMessage('Ticket created successfully.', 'success');
          form.resetForm(this.getDefaultTicket());
          this.resetSeatSelection();
        },
        error: () => {
          this.isSubmitting = false;
          this.showToastMessage('Ticket creation failed. Try again.', 'error');
        },
      });
    }
  }
}
