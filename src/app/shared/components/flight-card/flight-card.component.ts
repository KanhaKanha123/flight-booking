import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Flight } from '../../../core/models/flight.model';
import { getCityLabel } from '../../../mock-data/cities';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-flight-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './flight-card.component.html',
  styleUrls: ['./flight-card.component.scss'],
})
export class FlightCardComponent {
  @Input({ required: true })
  flight!: Flight;

  @Input()
  selected = false;

  @Output()
  readonly flightSelected = new EventEmitter<Flight>();

  selectFlight(): void {
    this.flightSelected.emit(this.flight);
  }

  getCityLabel(cityId: number | undefined, fallback?: string): string {
    return getCityLabel(cityId, fallback);
  }
}
