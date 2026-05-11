import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-air',
  templateUrl: './air.component.html',
  styleUrls: ['./air.component.css'],
})
export class AirComponent {
  tripType: string = 'oneWay';

  searchFrom: string = '';
  searchTo: string = '';

  journeyDate: string = '';
  returnDate: string = '';

  showDropdown: boolean = false;

  selectedClass: string = 'Economy';

  adult: number = 1;
  child: number = 0;
  infant: number = 0;

  constructor(private router: Router) {}

  onTripTypeChange(value: string): void {
    this.tripType = value;

    if (value === 'oneWay') {
      this.returnDate = '';
    }
  }

  toggleTravelerDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  increaseAdult(): void {
    this.adult++;
  }

  decreaseAdult(): void {
    if (this.adult > 1) {
      this.adult--;
    }
  }

  increaseChild(): void {
    this.child++;
  }

  decreaseChild(): void {
    if (this.child > 0) {
      this.child--;
    }
  }

  increaseInfant(): void {
    this.infant++;
  }

  decreaseInfant(): void {
    if (this.infant > 0) {
      this.infant--;
    }
  }

  getSeatTypeValue(): string {
    switch (this.selectedClass) {
      case 'Business':
        return 'BusinessClass';
      case 'First Class':
        return 'FirstClass';
      case 'Premium Economy':
        return 'EconomyClass';
      default:
        return 'EconomyClass';
    }
  }

  searchAirTickets(): void {
    this.router.navigate(['/air-ticket-list'], {
      queryParams: {
        from: this.searchFrom.trim(),
        to: this.searchTo.trim(),
        travelDate: this.journeyDate,
        seatType: this.getSeatTypeValue(),
        adult: this.adult,
        child: this.child,
        infant: this.infant,
      },
    });
  }
}
