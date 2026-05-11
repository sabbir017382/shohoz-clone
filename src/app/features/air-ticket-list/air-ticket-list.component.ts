import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AirServiceService } from 'src/app/core/services/air-service.service';
import { AirTicket } from 'src/app/models/airTicket';

@Component({
  selector: 'app-air-ticket-list',
  templateUrl: './air-ticket-list.component.html',
  styleUrls: ['./air-ticket-list.component.css'],
})
export class AirTicketListComponent implements OnInit {
  allTickets: AirTicket[] = [];
  filteredTickets: AirTicket[] = [];

  // Filter properties
  selectedStops: number | null = null;
  selectedAirlines: string[] = [];
  priceRange = { min: 0, max: 10000 };
  originalPriceRange = { min: 0, max: 10000 }; // Store original full range
  selectedDepartureTimes: string[] = [];

  // Airlines list with count
  airlines: { name: string; count: number }[] = [];
  departureTimeSlots = [
    { label: 'Early Morning', range: '00:00 - 04:59', key: 'earlyMorning' },
    { label: 'Morning', range: '05:00 - 11:59', key: 'morning' },
    { label: 'Afternoon', range: '12:00 - 16:59', key: 'afternoon' },
    { label: 'Evening', range: '17:00 - 20:59', key: 'evening' },
    { label: 'Night', range: '21:00 - 23:59', key: 'night' },
  ];

  sortOrder: 'low' | 'high' = 'low';

  searchCriteria = {
    from: '',
    to: '',
    travelDate: '',
    seatType: '',
    adult: 1,
    child: 0,
    infant: 0,
  };

  // Search form properties
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

  constructor(
    private airService: AirServiceService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchCriteria.from = params['from'] || '';
      this.searchCriteria.to = params['to'] || '';
      this.searchCriteria.travelDate = params['travelDate'] || '';
      this.searchCriteria.seatType = params['seatType'] || '';
      this.searchCriteria.adult = Number(params['adult']) || 1;
      this.searchCriteria.child = Number(params['child']) || 0;
      this.searchCriteria.infant = Number(params['infant']) || 0;

      // Set form properties from searchCriteria
      this.searchFrom = this.searchCriteria.from;
      this.searchTo = this.searchCriteria.to;
      this.journeyDate = this.searchCriteria.travelDate;
      this.adult = this.searchCriteria.adult;
      this.child = this.searchCriteria.child;
      this.infant = this.searchCriteria.infant;
      this.selectedClass = this.getClassFromSeatType(
        this.searchCriteria.seatType,
      );

      this.loadTickets();
    });
  }

  loadTickets(): void {
    this.airService.getTickets().subscribe(
      (tickets: AirTicket[]) => {
        this.allTickets = tickets;
        this.initializeFilters();
        this.applyFilters();
      },
      (error) => {
        console.error('Error loading tickets:', error);
      },
    );
  }

  initializeFilters(): void {
    // Get unique airlines with count
    const airlinesMap = new Map<string, number>();
    this.allTickets.forEach((ticket) => {
      const airline = ticket.bimanName;
      airlinesMap.set(airline, (airlinesMap.get(airline) || 0) + 1);
    });

    this.airlines = Array.from(airlinesMap, ([name, count]) => ({
      name,
      count,
    }));

    // Set initial price range
    if (this.allTickets.length > 0) {
      const prices = this.allTickets.map((t) => t.priceForAdult);
      this.originalPriceRange.min = Math.min(...prices);
      this.originalPriceRange.max = Math.max(...prices);
      this.priceRange.min = this.originalPriceRange.min;
      this.priceRange.max = this.originalPriceRange.max;
    }
  }

  applyFilters(): void {
    let filtered = [...this.allTickets];

    // Apply search criteria from air search box first
    filtered = filtered.filter((ticket) => this.matchesSearchCriteria(ticket));

    // Filter by stops - all tickets are non-stop (0 stops)
    if (this.selectedStops !== null) {
      if (this.selectedStops !== 0) {
        filtered = [];
      }
    }

    // Filter by airlines
    if (this.selectedAirlines.length > 0) {
      filtered = filtered.filter((ticket) =>
        this.selectedAirlines.includes(ticket.bimanName),
      );
    }

    // Filter by price range (adult fare baseline)
    filtered = filtered.filter(
      (ticket) =>
        ticket.priceForAdult >= this.priceRange.min &&
        ticket.priceForAdult <= this.priceRange.max,
    );

    // Filter by departure time
    if (this.selectedDepartureTimes.length > 0) {
      filtered = filtered.filter((ticket) => {
        const deptHour = parseInt(ticket.departureTime.split(':')[0]);
        return this.selectedDepartureTimes.some((timeSlot) =>
          this.isTimeInSlot(deptHour, timeSlot),
        );
      });
    }

    // Sort by price
    filtered.sort((a, b) => {
      if (this.sortOrder === 'low') {
        return this.getTicketTotalPrice(a) - this.getTicketTotalPrice(b);
      } else {
        return this.getTicketTotalPrice(b) - this.getTicketTotalPrice(a);
      }
    });

    this.filteredTickets = filtered;
  }

  matchesSearchCriteria(ticket: AirTicket): boolean {
    const normalize = (value: string) =>
      value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const searchFrom = normalize(this.searchCriteria.from);
    const searchTo = normalize(this.searchCriteria.to);
    const ticketFrom = normalize(ticket.from);
    const ticketTo = normalize(ticket.to);

    const fromMatch =
      !searchFrom ||
      ticketFrom.includes(searchFrom) ||
      searchFrom.includes(ticketFrom);
    const toMatch =
      !searchTo || ticketTo.includes(searchTo) || searchTo.includes(ticketTo);
    const dateMatch =
      !this.searchCriteria.travelDate ||
      ticket.travelDate === this.searchCriteria.travelDate;
    const seatTypeMatch =
      !this.searchCriteria.seatType ||
      this.getAvailableSeatCount(ticket, this.searchCriteria.seatType) > 0;

    const requiredSeats = this.searchCriteria.adult + this.searchCriteria.child;
    const availableSeats = this.getAvailableSeatCount(
      ticket,
      this.searchCriteria.seatType,
    );
    const seatMatch = requiredSeats === 0 || availableSeats >= requiredSeats;

    return fromMatch && toMatch && dateMatch && seatTypeMatch && seatMatch;
  }

  getAvailableSeatCount(ticket: AirTicket, seatType: string): number {
    switch (seatType) {
      case 'BusinessClass':
        return ticket.availableBcSeats?.length ?? 0;
      case 'FirstClass':
        return ticket.availableFcSeats?.length ?? 0;
      default:
        return ticket.availableEcSeats?.length ?? 0;
    }
  }

  getTicketTotalPrice(ticket: AirTicket): number {
    const adultCount = this.searchCriteria.adult || 0;
    const childCount = this.searchCriteria.child || 0;
    return (
      adultCount * ticket.priceForAdult + childCount * ticket.priceForChild
    );
  }

  getPassengerLabel(): string {
    const parts: string[] = [];
    if (this.searchCriteria.adult) {
      parts.push(
        `${this.searchCriteria.adult} Adult${this.searchCriteria.adult > 1 ? 's' : ''}`,
      );
    }
    if (this.searchCriteria.child) {
      parts.push(
        `${this.searchCriteria.child} Child${this.searchCriteria.child > 1 ? 'ren' : ''}`,
      );
    }
    if (this.searchCriteria.infant) {
      parts.push(
        `${this.searchCriteria.infant} Infant${this.searchCriteria.infant > 1 ? 's' : ''}`,
      );
    }
    return parts.length ? parts.join(', ') : '1 Traveler';
  }

  getBaggageAllowance(): string {
    switch (this.searchCriteria.seatType) {
      case 'EconomyClass':
        return '23 kg';
      case 'BusinessClass':
        return '32 kg';
      case 'FirstClass':
        return '40 kg';
      default:
        return '23 kg';
    }
  }

  isTimeInSlot(hour: number, timeSlot: string): boolean {
    const timeRanges: { [key: string]: [number, number] } = {
      earlyMorning: [0, 4],
      morning: [5, 11],
      afternoon: [12, 16],
      evening: [17, 20],
      night: [21, 23],
    };

    const [start, end] = timeRanges[timeSlot];
    return hour >= start && hour <= end;
  }

  onStopChange(stops: number): void {
    this.selectedStops = this.selectedStops === stops ? null : stops;
    this.applyFilters();
  }

  onAirlineChange(airline: string, isChecked: boolean): void {
    if (isChecked) {
      this.selectedAirlines.push(airline);
    } else {
      this.selectedAirlines = this.selectedAirlines.filter(
        (a) => a !== airline,
      );
    }
    this.applyFilters();
  }

  onPriceRangeChange(min: number, max: number): void {
    this.priceRange.min = min;
    this.priceRange.max = max;
    this.applyFilters();
  }

  onMinPriceChange(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (value <= this.priceRange.max) {
      this.priceRange.min = value;
      this.applyFilters();
    }
  }

  onMaxPriceChange(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (value >= this.priceRange.min) {
      this.priceRange.max = value;
      this.applyFilters();
    }
  }

  getLeftPosition(): number {
    const range = this.originalPriceRange.max - this.originalPriceRange.min;
    return range === 0
      ? 0
      : ((this.priceRange.min - this.originalPriceRange.min) / range) * 100;
  }

  getRangeWidth(): number {
    const range = this.originalPriceRange.max - this.originalPriceRange.min;
    return range === 0
      ? 0
      : ((this.priceRange.max - this.priceRange.min) / range) * 100;
  }

  onDepartureTimeChange(timeSlot: string, isChecked: boolean): void {
    if (isChecked) {
      this.selectedDepartureTimes.push(timeSlot);
    } else {
      this.selectedDepartureTimes = this.selectedDepartureTimes.filter(
        (t) => t !== timeSlot,
      );
    }
    this.applyFilters();
  }

  setSortOrder(order: 'low' | 'high'): void {
    this.sortOrder = order;
    this.applyFilters();
  }

  resetFilters(): void {
    this.selectedStops = null;
    this.selectedAirlines = [];
    this.selectedDepartureTimes = [];
    this.sortOrder = 'low';

    if (this.allTickets.length > 0) {
      const prices = this.allTickets.map((t) => t.priceForAdult);
      this.priceRange.min = Math.min(...prices);
      this.priceRange.max = Math.max(...prices);
    }

    this.applyFilters();
  }

  // Search form methods
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

  getClassFromSeatType(seatType: string): string {
    switch (seatType) {
      case 'BusinessClass':
        return 'Business';
      case 'FirstClass':
        return 'First Class';
      default:
        return 'Economy';
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
