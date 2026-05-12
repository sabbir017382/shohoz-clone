import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { TicketService } from 'src/app/core/services/ticket.service';
import { AirServiceService } from 'src/app/core/services/air-service.service';
import { Ticket } from 'src/app/models/ticket';
import { AirTicket } from 'src/app/models/airTicket';
import { HttpClient } from '@angular/common/http';

interface PassengerDetail {
  type: 'Adult' | 'Child' | 'Infant';
  title: 'MR' | 'MS' | 'MRS';
  firstName: string;
  lastName: string;
  dob: string;
  frequentFlyer: string;
}

@Component({
  selector: 'app-payment-process',
  templateUrl: './payment-process.component.html',
  styleUrls: ['./payment-process.component.css'],
})
export class PaymentProcessComponent implements OnInit {
  paymentMethods = [
    {
      name: 'bKash',
      logo: 'https://s3-ap-south-1.amazonaws.com/shohoz-bus/prod/payment-methods/bkash.svg?v=1.0.4',
    },
    {
      name: 'Nagad',
      logo: 'https://s3-ap-south-1.amazonaws.com/shohoz-bus/prod/payment-methods/nagad.svg?v=1.0.4',
    },
    {
      name: 'SSLCOMMERZ',
      logo: 'https://s3-ap-south-1.amazonaws.com/shohoz-bus/prod/payment-methods/ssl.png?v=1.0.4',
    },
    {
      name: 'Amex Cards',
      logo: 'https://s3-ap-south-1.amazonaws.com/shohoz-bus/prod/payment-methods/amex.svg?v=1.0.4',
    },
    {
      name: 'Visa Cards',
      logo: 'https://s3-ap-south-1.amazonaws.com/shohoz-bus/prod/payment-methods/visa.svg?v=1.0.4',
    },
    {
      name: 'MasterCard Cards',
      logo: 'https://s3-ap-south-1.amazonaws.com/shohoz-bus/prod/payment-methods/mastercard.svg?v=1.0.4',
    },
  ];

  selectedPayment: string = ''; // default none selected
  insuranceAccepted: boolean = false;
  termsAccepted: boolean = false;
  showBenefits: boolean = false;

  selectedTicket: Ticket | null = null;
  selectedAirTicket: AirTicket | null = null;
  selectedSeats: string[] = [];
  totalPrice: number = 0;
  processingFee: number = 47;
  discount: number = 0;
  airPassengerCount = { adult: 1, child: 0, infant: 0 };
  couponCode: string = '';
  appliedCouponDiscount: number = 0;
  couponMessage: string = '';
  passengerDetails: PassengerDetail[] = [];
  selectedSeatType: 'EconomyClass' | 'BusinessClass' | 'FirstClass' =
    'EconomyClass';
  bookedSeatsForPassengers: string[] = [];

  showToast: boolean = false;
  toastMessage: string = '';

  get insurance(): number {
    return this.insuranceAccepted ? 10 : 0;
  }

  get totalPayable(): number {
    if (this.selectedAirTicket) {
      return (
        this.getAirTotalAmount() -
        this.appliedCouponDiscount +
        this.getAirInsuranceAmount() +
        this.getAirProcessingFee() +
        this.getAirBaggageProtection()
      );
    }
    return (
      this.totalPrice +
      this.processingFee -
      this.appliedCouponDiscount +
      this.discount +
      this.insurance
    );
  }

  get canProceed(): boolean {
    return (
      this.insuranceAccepted && this.termsAccepted && !!this.selectedPayment
    );
  }

  constructor(
    private ticketService: TicketService,
    private airService: AirServiceService,
    private router: Router,
    private http: HttpClient,
  ) {}

  toggleBenefits(): void {
    this.showBenefits = !this.showBenefits;
  }

  ngOnInit(): void {
    this.selectedAirTicket = this.airService.getSelectedTicket();
    this.selectedTicket = this.ticketService.getSelectedTicket();

    // Load seat type from localStorage for air tickets
    const savedSeatType = localStorage.getItem('selectedAirSeatType');
    if (
      savedSeatType &&
      (savedSeatType === 'EconomyClass' ||
        savedSeatType === 'BusinessClass' ||
        savedSeatType === 'FirstClass')
    ) {
      this.selectedSeatType = savedSeatType;
    }

    // Load passenger details from localStorage for air tickets
    const passengerDetailsStr = localStorage.getItem(
      'selectedAirPassengerDetails',
    );
    if (passengerDetailsStr) {
      try {
        this.passengerDetails = JSON.parse(passengerDetailsStr);
      } catch {
        this.passengerDetails = [];
      }
    }

    if (this.selectedAirTicket) {
      this.selectedTicket = null; // Air booking has priority over stale bus data
      this.loadAirPassengerCount();
      this.totalPrice = this.getAirTotalAmount();
      return;
    }

    if (this.selectedTicket) {
      this.selectedSeats =
        (this.selectedTicket as Ticket & { selectedSeats?: string[] })
          .selectedSeats || [];
      this.selectedAirTicket = null;
    }

    if (this.selectedTicket && this.selectedSeats.length > 0) {
      this.totalPrice = this.selectedSeats.length * this.selectedTicket.price;
    } else {
      this.totalPrice = parseFloat(localStorage.getItem('paymentTotal') || '0');
    }
  }

  confirmPayment(): void {
    if (!this.canProceed) {
      return;
    }

    if (this.selectedAirTicket) {
      // Select seats serially and create booking
      this.selectSeatsSerially();
      this.createAirTicketBooking();
      return;
    }

    if (!this.selectedTicket) {
      alert('No ticket selected to pay for.');
      return;
    }

    const boardingPoint = this.selectedTicket.boardingPoint?.[0] || '';
    this.ticketService
      .confirmBooking(
        this.selectedTicket as Ticket & { selectedSeats?: string[] },
        boardingPoint,
        this.totalPrice,
      )
      .subscribe(
        (response) => {
          console.log('Booking response:', response);
          this.toastMessage = 'Thank you for booking ticket from shohoz.com';
          this.showToast = true;
          setTimeout(() => {
            this.showToast = false;
            this.router.navigate(['/home']);
          }, 3000);
        },
        (error) => {
          console.error('Payment booking failed:', error);
          alert('Payment failed. Please try again.');
        },
      );
  }

  private loadAirPassengerCount(): void {
    const selectedSearch = localStorage.getItem('selectedAirTicketSearch');
    if (!selectedSearch) {
      return;
    }

    try {
      const parsed = JSON.parse(selectedSearch);
      this.airPassengerCount = {
        adult: parsed.adult || 1,
        child: parsed.child || 0,
        infant: parsed.infant || 0,
      };
    } catch {
      this.airPassengerCount = { adult: 1, child: 0, infant: 0 };
    }
  }

  getAirBaseFare(): number {
    if (!this.selectedAirTicket) {
      return 0;
    }
    return (
      this.airPassengerCount.adult * this.selectedAirTicket.priceForAdult +
      this.airPassengerCount.child * this.selectedAirTicket.priceForChild +
      this.airPassengerCount.infant * this.selectedAirTicket.priceForInfant
    );
  }

  getAirTaxAmount(): number {
    if (!this.selectedAirTicket) {
      return 0;
    }
    return (
      (this.airPassengerCount.adult +
        this.airPassengerCount.child +
        this.airPassengerCount.infant) *
      this.selectedAirTicket.Tax
    );
  }

  getAirSubTotal(): number {
    return this.getAirBaseFare() + this.getAirTaxAmount();
  }

  getAirAitVat(): number {
    return 0;
  }

  getAirTotalAmount(): number {
    if (!this.selectedAirTicket) {
      return 0;
    }
    return (
      this.getAirSubTotal() +
      this.getAirAitVat() +
      this.selectedAirTicket.OtherCharges
    );
  }

  getAirDiscount(): number {
    if (!this.selectedAirTicket || !this.selectedAirTicket.cuponCode) {
      return 0;
    }
    const code = this.selectedAirTicket.cuponCode.trim().toUpperCase();
    switch (code) {
      case 'DCCX':
      case 'DHCX':
        return 420;
      default:
        return 0;
    }
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      this.couponMessage = 'Please enter a coupon code';
      this.appliedCouponDiscount = 0;
      return;
    }

    const code = this.couponCode.trim().toUpperCase();

    if (this.selectedAirTicket) {
      if (code === 'DCCX' || code === 'DHCX') {
        this.appliedCouponDiscount = 420;
        this.couponMessage = `Coupon ${code} applied - ৳420 discount`;
      } else {
        this.appliedCouponDiscount = 0;
        this.couponMessage = 'Invalid coupon code';
      }
    } else {
      if (code === 'SAVE100' || code === 'TRAVEL50') {
        this.appliedCouponDiscount = code === 'SAVE100' ? 100 : 50;
        this.couponMessage = `Coupon ${code} applied - ৳${this.appliedCouponDiscount} discount`;
      } else {
        this.appliedCouponDiscount = 0;
        this.couponMessage = 'Invalid coupon code';
      }
    }
  }

  removeCoupon(): void {
    this.couponCode = '';
    this.appliedCouponDiscount = 0;
    this.couponMessage = '';
  }

  getAirInsuranceAmount(): number {
    return this.selectedAirTicket?.insurance ? 20 : 0;
  }

  getAirProcessingFee(): number {
    return this.selectedAirTicket?.processingFee || 0;
  }

  getAirBaggageProtection(): number {
    return 0;
  }

  getAirTotalPayable(): number {
    return (
      this.getAirTotalAmount() -
      this.appliedCouponDiscount +
      this.getAirInsuranceAmount() +
      this.getAirProcessingFee() +
      this.getAirBaggageProtection()
    );
  }

  private selectSeatsSerially(): void {
    if (!this.selectedAirTicket) {
      return;
    }

    // Determine which seat list to use based on seat type
    let availableSeats: string[] = [];
    const seatType = this.selectedSeatType || 'EconomyClass';

    if (seatType === 'EconomyClass') {
      availableSeats = [...(this.selectedAirTicket.availableEcSeats || [])];
    } else if (seatType === 'BusinessClass') {
      availableSeats = [...(this.selectedAirTicket.availableBcSeats || [])];
    } else if (seatType === 'FirstClass') {
      availableSeats = [...(this.selectedAirTicket.availableFcSeats || [])];
    }

    // Select seats serially for each passenger
    this.bookedSeatsForPassengers = [];
    for (let i = 0; i < this.passengerDetails.length; i++) {
      if (availableSeats.length > 0) {
        const seat = availableSeats.shift();
        if (seat) {
          this.bookedSeatsForPassengers.push(seat);
        }
      }
    }
  }

  private createAirTicketBooking(): void {
    if (!this.selectedAirTicket) {
      alert('Ticket not found');
      return;
    }

    // Create booking record
    const bookingData = {
      ticketId: this.selectedAirTicket.id,
      bimanName: this.selectedAirTicket.bimanName,
      bimanserialNo: this.selectedAirTicket.bimanserialNo,
      from: this.selectedAirTicket.from,
      to: this.selectedAirTicket.to,
      travelDate: this.selectedAirTicket.travelDate,
      departureTime: this.selectedAirTicket.departureTime,
      arrivalTime: this.selectedAirTicket.arrivalTime,
      seatType: this.selectedSeatType,
      bookedSeats: this.bookedSeatsForPassengers,
      passengers: this.passengerDetails,
      totalAmount: this.totalPayable,
      paymentMethod: this.selectedPayment,
      bookingDate: new Date().toISOString(),
    };

    // Create booking in database
    this.http
      .post('http://localhost:3000/airTicketBookings', bookingData)
      .subscribe(
        (response: any) => {
          // Update available seats
          this.updateAirTicketAvailableSeats();
        },
        (error) => {
          console.error('Failed to create booking:', error);
          alert('Booking failed. Please try again.');
        },
      );
  }

  private updateAirTicketAvailableSeats(): void {
    if (!this.selectedAirTicket) {
      return;
    }

    const updatedTicket = { ...this.selectedAirTicket };
    const seatType = this.selectedSeatType || 'EconomyClass';

    // Update the appropriate seat list
    if (seatType === 'EconomyClass') {
      updatedTicket.availableEcSeats = (
        updatedTicket.availableEcSeats || []
      ).filter((seat) => !this.bookedSeatsForPassengers.includes(seat));
    } else if (seatType === 'BusinessClass') {
      updatedTicket.availableBcSeats = (
        updatedTicket.availableBcSeats || []
      ).filter((seat) => !this.bookedSeatsForPassengers.includes(seat));
    } else if (seatType === 'FirstClass') {
      updatedTicket.availableFcSeats = (
        updatedTicket.availableFcSeats || []
      ).filter((seat) => !this.bookedSeatsForPassengers.includes(seat));
    }

    // Update ticket in database
    this.http
      .put(
        `http://localhost:3000/airTickets/${this.selectedAirTicket.id}`,
        updatedTicket,
      )
      .subscribe(
        (response) => {
          this.toastMessage =
            'Thank you for booking Air ticket from shohoz.com';
          this.showToast = true;
          setTimeout(() => {
            this.showToast = false;
            // Clear localStorage
            localStorage.removeItem('selectedAirTicket');
            localStorage.removeItem('selectedAirPassengerDetails');
            localStorage.removeItem('selectedAirSeatType');
            this.router.navigate(['/home']);
          }, 3000);
        },
        (error) => {
          console.error('Failed to update ticket:', error);
          alert('Booking confirmation failed. Please try again.');
        },
      );
  }
}
