import { Component } from '@angular/core';

@Component({
  selector: 'app-contactform',
  templateUrl: './contactform.component.html',
  styleUrls: ['./contactform.component.css'],
})
export class ContactformComponent {
  isSubmitted: boolean = false;

  onSubmit(form: any): void {
    this.isSubmitted = true;

    if (form.valid) {
      console.log('Form Data:', form.value);

      form.resetForm();
      this.isSubmitted = false;
    }
  }
}
