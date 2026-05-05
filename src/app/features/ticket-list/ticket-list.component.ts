import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Ticket } from 'src/app/models/ticket';
import { TicketService } from 'src/app/core/services/ticket.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css'],
})
export class TicketListComponent {
  ticketList: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  sortBy: string = '';

  filters = {
    ac: false,
    nonAc: false,
    operator: '',
    boarding: '',
    dropping: '',
    departureTime: '',
    arrivalTime: '',
  };

  operators: string[] = [];
  boardingPoints: string[] = [];
  droppingPoints: string[] = [];

  constructor(
    private service: TicketService,
    private router: Router,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.fetchTickets();
    this.extractFilterOptions();
  }

  fetchTickets() {
    this.service.getTickets().subscribe((res: Ticket[]) => {
      this.ticketList = res;
      this.filteredTickets = res;
      this.extractFilterOptions();
    });
  }

  searchTickets() {
    this.applyFilters();
  }

  extractFilterOptions() {
    const uniqueOperators = new Set<string>();
    const uniqueBoardingPoints = new Set<string>();
    const uniqueDroppingPoints = new Set<string>();

    this.ticketList.forEach((ticket) => {
      uniqueOperators.add(ticket.busName);
      ticket.boardingPoint?.forEach((point) => uniqueBoardingPoints.add(point));
      ticket.droppingPoint?.forEach((point) => uniqueDroppingPoints.add(point));
    });

    this.operators = Array.from(uniqueOperators);
    this.boardingPoints = Array.from(uniqueBoardingPoints);
    this.droppingPoints = Array.from(uniqueDroppingPoints);
  }

  applyFilters() {
    this.filteredTickets = this.ticketList.filter((ticket) => {
      const matchesOperator =
        !this.filters.operator || ticket.busName === this.filters.operator;
      const matchesBoarding =
        !this.filters.boarding ||
        ticket.boardingPoint?.includes(this.filters.boarding);
      const matchesDropping =
        !this.filters.dropping ||
        ticket.droppingPoint?.includes(this.filters.dropping);
      const boardingPoints = ticket.boardingPoint || [];
      const droppingPoints = ticket.droppingPoint || [];
      const matchesDepartureTime =
        !this.filters.departureTime ||
        (ticket.departureTime &&
          ticket.departureTime.startsWith(this.filters.departureTime));
      const matchesArrivalTime =
        !this.filters.arrivalTime ||
        (ticket.arrivalTime &&
          ticket.arrivalTime.startsWith(this.filters.arrivalTime));

      return (
        matchesOperator &&
        matchesBoarding &&
        matchesDropping &&
        matchesDepartureTime &&
        matchesArrivalTime
      );
    });

    this.applySort();
  }

  resetFilters() {
    this.filters = {
      ac: false,
      nonAc: false,
      operator: '',
      boarding: '',
      dropping: '',
      departureTime: '',
      arrivalTime: '',
    };
    this.sortBy = '';
    this.filteredTickets = this.ticketList;
  }

  setSort(type: string) {
    this.sortBy = type;
    this.applySort();
  }

  applySort() {
    if (this.sortBy === 'low') {
      this.filteredTickets.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'high') {
      this.filteredTickets.sort((a, b) => b.price - a.price);
    }
  }

  setDepartureTime(time: string) {
    this.filters.departureTime =
      this.filters.departureTime === time ? '' : time;
  }

  setArrivalTime(time: string) {
    this.filters.arrivalTime = this.filters.arrivalTime === time ? '' : time;
  }

  getOperatorInitials(busName: string): string {
    return busName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getAvailableSeats(ticket: Ticket): number {
    return ticket.availableSeats?.length || 0;
  }

  getRouteDuration(ticket: Ticket): string {
    const departure = new Date(`2000-01-01 ${ticket.departureTime}`);
    const arrival = new Date(`2000-01-01 ${ticket.arrivalTime}`);

    let diff = arrival.getTime() - departure.getTime();

    if (diff < 0) {
      diff += 24 * 60 * 60 * 1000;
    }

    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    return `${hours}h ${minutes}m`;
  }

  bookTicket(ticket: Ticket) {
    this.router.navigate(['/book'], { state: { ticket } });
  }

  //for search box control
  tripType: string = 'oneWay';

  @ViewChild('journeyDateInput')
  journeyDateInput!: ElementRef<HTMLInputElement>;
  @ViewChild('returnDateInput') returnDateInput!: ElementRef<HTMLInputElement>;

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
}
