import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AirServiceService } from 'src/app/core/services/air-service.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { AirTicket } from 'src/app/models/airTicket';
import { User } from 'src/app/models/user';

interface PassengerDetail {
  type: 'Adult' | 'Child' | 'Infant';
  title: 'MR' | 'MS' | 'MRS';
  firstName: string;
  lastName: string;
  dob: string;
  frequentFlyer: string;
}

@Component({
  selector: 'app-air-ticket-booking',
  templateUrl: './air-ticket-booking.component.html',
  styleUrls: ['./air-ticket-booking.component.css'],
})
export class AirTicketBookingComponent implements OnInit {
  user: User | null = null;
  ticket: AirTicket | null = null;

  @ViewChild('bookingForm') bookingForm!: NgForm;

  contactMobile: string = '';
  contactEmail: string = '';
  passengerDetails: PassengerDetail[] = [];

  adultCount = 1;
  childCount = 0;
  infantCount = 0;

  constructor(
    private authService: AuthService,
    private airService: AirServiceService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.user = this.fetchUser();
    this.ticket = this.airService.getSelectedTicket();

    const selectedSearch = localStorage.getItem('selectedAirTicketSearch');
    if (selectedSearch) {
      try {
        const parsed = JSON.parse(selectedSearch);
        this.adultCount = parsed.adult || 1;
        this.childCount = parsed.child || 0;
        this.infantCount = parsed.infant || 0;
      } catch {
        this.adultCount = 1;
        this.childCount = 0;
        this.infantCount = 0;
      }
    }

    this.initPassengers();

    if (!this.user) {
      return;
    }

    this.contactMobile = this.user.mobile;
    this.contactEmail = this.user.email;

    if (!this.ticket) {
      this.router.navigate(['/air-ticket-list']);
    }
  }

  private initPassengers(): void {
    const passengers: PassengerDetail[] = [];

    for (let i = 0; i < this.adultCount; i++) {
      passengers.push(this.createPassenger('Adult', i === 0));
    }

    for (let i = 0; i < this.childCount; i++) {
      passengers.push(this.createPassenger('Child'));
    }

    for (let i = 0; i < this.infantCount; i++) {
      passengers.push(this.createPassenger('Infant'));
    }

    this.passengerDetails = passengers;

    if (this.passengerDetails.length > 0 && this.user) {
      this.passengerDetails[0].firstName = this.user.firstName;
      this.passengerDetails[0].lastName = this.user.lastName;
      this.passengerDetails[0].title = 'MR';
    }
  }

  private createPassenger(
    type: 'Adult' | 'Child' | 'Infant',
    isFirst: boolean = false,
  ): PassengerDetail {
    return {
      type,
      title: 'MR',
      firstName: isFirst ? this.user!.firstName : '',
      lastName: isFirst ? this.user!.lastName : '',
      dob: '',
      frequentFlyer: '',
    };
  }

  fetchUser(): User | null {
    const userData = this.authService.getUser();
    if (userData) {
      return userData;
    }
    this.router.navigate(['/login']);
    return null;
  }
  getFlightDuration(ticket: AirTicket): string {
    try {
      const deptTime = ticket.departureTime.split(':');
      const arrTime = ticket.arrivalTime.split(':');

      let deptHours = parseInt(deptTime[0], 10);
      let deptMinutes = parseInt(deptTime[1], 10);
      let arrHours = parseInt(arrTime[0], 10);
      let arrMinutes = parseInt(arrTime[1], 10);

      // Convert to minutes
      let deptTotalMinutes = deptHours * 60 + deptMinutes;
      let arrTotalMinutes = arrHours * 60 + arrMinutes;

      if (arrTotalMinutes <= deptTotalMinutes) {
        arrTotalMinutes += 24 * 60;
      }

      let durationMinutes = arrTotalMinutes - deptTotalMinutes;
      let hours = Math.floor(durationMinutes / 60);
      let minutes = durationMinutes % 60;

      return `${hours}h ${minutes}m`;
    } catch (error) {
      return 'failed to calculate';
    }
  }
  getBaggageAllowance(): string {
    if (!this.ticket) {
      return '23 kg';
    }
    switch (this.ticket.seatType) {
      case 'BusinessClass':
        return '32 kg';
      case 'FirstClass':
        return '40 kg';
      default:
        return '23 kg';
    }
  }

  getSeatTypeDisplay(seatType: string): string {
    switch (seatType) {
      case 'BusinessClass':
        return 'Business';
      case 'FirstClass':
        return 'Business (U)';
      default:
        return 'Economy';
    }
  }

  getDiscountAmount(): number {
    if (!this.ticket || !this.ticket.cuponCode) {
      return 0;
    }
    const normalizedCode = this.ticket.cuponCode.trim().toUpperCase();
    switch (normalizedCode) {
      case 'DCCX':
      case 'DHCX':
        return 999;
      default:
        return 0;
    }
  }

  getBaseFare(): number {
    if (!this.ticket) {
      return 0;
    }
    return (
      this.adultCount * this.ticket.priceForAdult +
      this.childCount * this.ticket.priceForChild +
      this.infantCount * this.ticket.priceForInfant
    );
  }

  getTaxAmount(): number {
    if (!this.ticket) {
      return 0;
    }
    return (
      this.adultCount * this.ticket.Tax +
      this.childCount * this.ticket.Tax +
      this.infantCount * this.ticket.Tax
    );
  }

  getTotalFare(): number {
    if (!this.ticket) {
      return 0;
    }
    const baseFare = this.getBaseFare();
    const tax = this.getTaxAmount();
    const otherCharges = this.ticket.OtherCharges || 0;
    const processingFee = this.ticket.processingFee || 0;
    const discount = this.getDiscountAmount();
    return baseFare + tax + otherCharges + processingFee - discount;
  }

  getPassengerLabel(): string {
    const parts: string[] = [];
    if (this.adultCount) {
      parts.push(`${this.adultCount} Adult${this.adultCount > 1 ? 's' : ''}`);
    }
    if (this.childCount) {
      parts.push(`${this.childCount} Child${this.childCount > 1 ? 'ren' : ''}`);
    }
    if (this.infantCount) {
      parts.push(
        `${this.infantCount} Infant${this.infantCount > 1 ? 's' : ''}`,
      );
    }
    return parts.length ? parts.join(', ') : '1 Traveler';
  }

  proceedToPayment(): void {
    if (!this.bookingForm.valid) {
      return;
    }
    if (!this.ticket) {
      return;
    }
    localStorage.setItem(
      'selectedAirPassengerDetails',
      JSON.stringify(this.passengerDetails),
    );
    this.router.navigate(['/payment']);
  }
}
