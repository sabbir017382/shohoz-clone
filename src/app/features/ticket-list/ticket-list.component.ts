import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Ticket } from 'src/app/models/ticket';
import { TicketService } from 'src/app/core/services/ticket.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css'],
})
export class TicketListComponent implements OnInit {
  ticketList: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  sortBy: string = '';
  hasSearched: boolean = false;

  // Booking panel
  showBookingPanel: boolean = false;
  selectedTicket: Ticket | null = null;

  // search inputs
  searchFrom: string = '';
  searchTo: string = '';
  journeyDate: string = '';

  // intermediate search results (before applying sidebar filters)
  searchFilteredTickets: Ticket[] = [];

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
    this.loadNavigationState();

    // load available tickets into memory but don't show anything until searched
    this.fetchTickets();

    // if search params were passed from home, auto-search
    if (this.searchFrom || this.searchTo || this.journeyDate) {
      setTimeout(() => {
        this.searchTickets();
      }, 100);
    }
  }

  private loadNavigationState(): void {
    const state =
      this.router.getCurrentNavigation()?.extras?.state ?? window.history.state;

    if (state && typeof state === 'object') {
      this.searchFrom = state.searchFrom || '';
      this.searchTo = state.searchTo || '';
      this.journeyDate = state.journeyDate || '';
      this.tripType = (state.tripType as string) || 'oneWay';
    }
  }

  fetchTickets() {
    this.service.getTickets().subscribe((res: Ticket[]) => {
      this.ticketList = res;
      // update filter option lists based on full dataset
      this.extractFilterOptions();
    });
  }

  // called when SEARCH button is clicked
  searchTickets() {
    // if no search criteria provided, show nothing
    if (!this.searchFrom && !this.searchTo && !this.journeyDate) {
      this.hasSearched = false;
      this.searchFilteredTickets = [];
      this.filteredTickets = [];
      return;
    }

    if (this.ticketList.length === 0) {
      // ensure tickets are loaded first
      this.service.getTickets().subscribe((res: Ticket[]) => {
        this.ticketList = res;
        this.extractFilterOptions();
        this.performSearchAndFilter();
      });
    } else {
      this.performSearchAndFilter();
    }
  }

  performSearchAndFilter() {
    const from = this.searchFrom?.trim().toLowerCase();
    const to = this.searchTo?.trim().toLowerCase();
    const date = this.journeyDate?.trim();

    this.searchFilteredTickets = this.ticketList.filter((ticket) => {
      const tFrom = (ticket.from || '').toString().toLowerCase();
      const tTo = (ticket.to || '').toString().toLowerCase();
      const matchesFrom = !from || tFrom.includes(from);
      const matchesTo = !to || tTo.includes(to);

      let matchesDate = true;
      if (date) {
        const ticketDate = ticket.departureDate
          ? new Date(ticket.departureDate).toISOString().slice(0, 10)
          : '';
        matchesDate = ticketDate === date;
      }

      return matchesFrom && matchesTo && matchesDate;
    });

    this.hasSearched = true;
    // update filter options based on current search results
    this.extractFilterOptions();
    // apply sidebar filters on top of search results
    this.applyFilters();
  }

  extractFilterOptions() {
    const source =
      this.hasSearched && this.searchFilteredTickets.length
        ? this.searchFilteredTickets
        : this.ticketList;

    const uniqueOperators = new Set<string>();
    const uniqueBoardingPoints = new Set<string>();
    const uniqueDroppingPoints = new Set<string>();

    source.forEach((ticket) => {
      if (ticket.busName) uniqueOperators.add(ticket.busName);
      ticket.boardingPoint?.forEach((point) => uniqueBoardingPoints.add(point));
      ticket.droppingPoint?.forEach((point) => uniqueDroppingPoints.add(point));
    });

    this.operators = Array.from(uniqueOperators);
    this.boardingPoints = Array.from(uniqueBoardingPoints);
    this.droppingPoints = Array.from(uniqueDroppingPoints);
  }

  applyFilters() {
    // if user hasn't searched, show nothing
    if (!this.hasSearched) {
      this.filteredTickets = [];
      return;
    }

    this.filteredTickets = this.searchFilteredTickets.filter((ticket) => {
      const matchesOperator =
        !this.filters.operator || ticket.busName === this.filters.operator;
      const matchesBoarding =
        !this.filters.boarding ||
        ticket.boardingPoint?.includes(this.filters.boarding);
      const matchesDropping =
        !this.filters.dropping ||
        ticket.droppingPoint?.includes(this.filters.dropping);
      const matchesDepartureTime =
        !this.filters.departureTime ||
        (ticket.departureTime &&
          ticket.departureTime.startsWith(this.filters.departureTime));
      const matchesArrivalTime =
        !this.filters.arrivalTime ||
        (ticket.arrivalTime &&
          ticket.arrivalTime.startsWith(this.filters.arrivalTime));

      // // Bus type filter (AC / Non AC) if present on ticket
      // let matchesBusType = true;
      // if (this.filters.ac && !this.filters.nonAc) {
      //   matchesBusType = ticket.busType?.toLowerCase() === 'ac';
      // } else if (!this.filters.ac && this.filters.nonAc) {
      //   matchesBusType = ticket.busType?.toLowerCase() === 'non ac' || ticket.busType?.toLowerCase() === 'non-ac';
      // }

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
    // reset to search results if a search is active, otherwise empty
    this.filteredTickets = this.hasSearched
      ? this.searchFilteredTickets.slice()
      : [];
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
    this.applyFilters();
  }

  setArrivalTime(time: string) {
    this.filters.arrivalTime = this.filters.arrivalTime === time ? '' : time;
    this.applyFilters();
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
    this.selectedTicket = ticket;
    this.showBookingPanel = true;
  }

  closeBookingPanel() {
    this.showBookingPanel = false;
    this.selectedTicket = null;
    // Refresh tickets to show updated availableSeats
    this.fetchTickets();
  }

  // for search box control
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
