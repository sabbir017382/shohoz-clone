import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { TicketService } from 'src/app/core/services/ticket.service';
import { Ticket } from 'src/app/models/ticket';

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
  selectedSeats: string[] = [];
  totalPrice: number = 0;
  processingFee: number = 47;
  discount: number = 0;

  showToast: boolean = false;
  toastMessage: string = '';

  get insurance(): number {
    return this.insuranceAccepted ? 10 : 0;
  }

  get totalPayable(): number {
    return (
      this.totalPrice + this.processingFee + this.discount + this.insurance
    );
  }

  get canProceed(): boolean {
    return (
      this.insuranceAccepted && this.termsAccepted && !!this.selectedPayment
    );
  }

  constructor(
    private ticketService: TicketService,
    private router: Router,
  ) {}

  toggleBenefits(): void {
    this.showBenefits = !this.showBenefits;
  }

  ngOnInit(): void {
    this.selectedTicket = this.ticketService.getSelectedTicket();
    this.selectedSeats =
      (this.selectedTicket as Ticket & { selectedSeats?: string[] })
        .selectedSeats || [];

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
}
