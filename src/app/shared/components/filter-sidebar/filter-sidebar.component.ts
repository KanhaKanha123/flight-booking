import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightFilters } from '../../../core/models/filter-sidebar.model';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-sidebar.component.html',
  styleUrls: ['./filter-sidebar.component.scss'],
})
export class FilterSidebarComponent {
  private readonly fb = inject(FormBuilder);

  @Input()
  airlines: string[] = [];

  @Output()
  readonly filtersChanged = new EventEmitter<FlightFilters>();

  readonly departureSlots = ['Morning', 'Afternoon', 'Evening'];

  // Form group to manage filter selections
  filterForm = this.fb.group({
    airlines: [[] as string[]],
    departureSlots: [[] as string[]],
    sortBy: ['price' as 'price' | 'duration'],
  });

  constructor() {
    this.filterForm.valueChanges.subscribe((value) => {
      this.filtersChanged.emit({
        airlines: value.airlines ?? [],
        departureSlots: value.departureSlots ?? [],
        sortBy: (value.sortBy ?? 'price') as 'price' | 'duration',
      });
    });
  }

  // Helper methods for toggling filter options and checking if an option is selected
  toggleAirline(airline: string): void {
    const selected = [...(this.filterForm.value.airlines ?? [])];
    const index = selected.indexOf(airline);

    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(airline);
    }

    this.filterForm.patchValue({
      airlines: selected,
    });
  }

  // Helper methods for toggling filter options and checking if an option is selected
  toggleSlot(slot: string): void {
    const selected = [...(this.filterForm.value.departureSlots ?? [])];

    const index = selected.indexOf(slot);

    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(slot);
    }

    this.filterForm.patchValue({
      departureSlots: selected,
    });
  }

  isAirlineSelected(airline: string): boolean {
    return (this.filterForm.value.airlines ?? []).includes(airline);
  }

  isSlotSelected(slot: string): boolean {
    return (this.filterForm.value.departureSlots ?? []).includes(slot);
  }
}
