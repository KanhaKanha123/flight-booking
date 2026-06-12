import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Flight } from '../../../core/models/flight.model';
import { getCityLabel } from '../../../mock-data/cities';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-flight-summary-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './flight-summary-card.component.html',
  styleUrls: ['./flight-summary-card.component.scss'],
})
export class FlightSummaryCardComponent {
  @Input({ required: true })
  flight!: Flight;

  @Input()
  title = 'Flight';

  getCityLabel(cityId: number | undefined, fallback?: string): string {
    return getCityLabel(cityId, fallback);
  }
}
