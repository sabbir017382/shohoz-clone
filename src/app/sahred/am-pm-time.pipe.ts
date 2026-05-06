import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'amPmTime',
})
export class AmPmTimePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const time = value.trim();
    if (!time) {
      return '';
    }

    const lower = time.toLowerCase();
    if (lower.includes('am') || lower.includes('pm')) {
      return time.toUpperCase();
    }

    const match = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!match) {
      return time;
    }

    let hours = Number(match[1]);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';

    if (hours === 0) {
      hours = 12;
    } else if (hours > 12) {
      hours -= 12;
    }

    return `${hours}:${minutes} ${ampm}`;
  }
}
