import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  tripType: string = 'oneWay';
  searchFrom: string = '';
  searchTo: string = '';
  journeyDate: string = '';
  returnDate: string = '';

  @ViewChild('journeyDateInput')
  journeyDateInput!: ElementRef<HTMLInputElement>;
  @ViewChild('returnDateInput') returnDateInput!: ElementRef<HTMLInputElement>;

  constructor(private router: Router) {}

  onTripTypeChange(value: string) {
    this.tripType = value;

    if (value === 'roundWay') {
      setTimeout(() => {
        this.openReturnPicker();
      }, 0);
    }
  }

  openJourneyPicker() {
    const input = this.journeyDateInput?.nativeElement;
    if (input && typeof input.showPicker === 'function') {
      input.showPicker();
    }
  }

  openReturnPicker(event?: MouseEvent) {
    if (this.tripType === 'oneWay') {
      this.tripType = 'roundWay';

      setTimeout(() => {
        this.openReturnPicker();
      }, 0);

      return;
    }

    const input = this.returnDateInput?.nativeElement;
    if (input && typeof input.showPicker === 'function') {
      input.showPicker();
    }
  }

  searchTickets() {
    this.router.navigate(['/ticket-list'], {
      state: {
        searchFrom: this.searchFrom,
        searchTo: this.searchTo,
        journeyDate: this.journeyDate,
        returnDate: this.returnDate,
        tripType: this.tripType,
      },
    });
  }
}
