import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FlightSearchCriteria } from '../../core/models/flight.model';
import { FlightService } from '../../core/services/flight.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CITIES, getCityLabel } from '../../mock-data/cities';
import { City } from '../../core/models/flight.model';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.scss'],
})
export class FlightSearchComponent implements OnInit {
  readonly cities = CITIES;

  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  private flightService = inject(FlightService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly isRoundTrip = signal(false);

  readonly today = new Date();

  readonly filteredOrigins = signal<City[]>([...this.cities]);
  readonly filteredDestinations = signal<City[]>([...this.cities]);

  readonly showError = computed(() => !this.loading() && !!this.errorMessage());

  searchForm = this.fb.group(
    {
      originId: [null as number | null, Validators.required],
      destinationId: [null as number | null, Validators.required],
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      departureDate: [null as Date | null, Validators.required],
      returnDate: [
        {
          value: null as Date | null,
          disabled: true,
        },
      ],
      roundTrip: [false],
      passengers: [1],
    },
    {
      validators: [
        this.validateTripDates.bind(this),
        this.validateCities.bind(this),
        this.validateSelectedCities.bind(this),
      ],
    },
  );

  constructor() {
    this.initializeListeners();
  }

  ngOnInit(): void {
    const criteria = this.flightService.getSearchCriteria();

    if (!criteria) {
      return;
    }

    // If there are saved search criteria (e.g. when user goes back to search page after executing a search), we restore the form state and filtered city lists based on those criteria.
    this.searchForm.patchValue({
      originId: criteria.originId,
      destinationId: criteria.destinationId,
      departureDate: criteria.departureDate,
      returnDate: criteria.returnDate,
      roundTrip: criteria.roundTrip,
    });

    const originCity = this.cities.find((city) => city.id === criteria.originId);
    const destinationCity = this.cities.find((city) => city.id === criteria.destinationId);

    if (originCity) {
      this.searchForm.patchValue({
        origin: originCity.label,
      });
    }

    if (destinationCity) {
      this.searchForm.patchValue({
        destination: destinationCity.label,
      });
    }

    this.isRoundTrip.set(!!criteria.roundTrip);
  }

  private validateCities(control: AbstractControl): ValidationErrors | null {
    const originId = control.get('originId')?.value;
    const destinationId = control.get('destinationId')?.value;

    if (originId && destinationId && originId === destinationId) {
      return {
        sameCity: true,
      };
    }

    return null;
  }

  private validateTripDates(control: AbstractControl): ValidationErrors | null {
    const departureDate = control.get('departureDate')?.value;
    const returnDate = control.get('returnDate')?.value;
    const roundTrip = control.get('roundTrip')?.value;

    if (roundTrip && departureDate && returnDate && returnDate < departureDate) {
      return {
        invalidDateRange: true,
      };
    }

    return null;
  }

  filterOrigins(query?: string | City): void {
    const searchValue = query ?? this.searchForm.get('origin')?.value ?? '';

    this.filteredOrigins.set(this.filterCities(searchValue));
  }

  filterDestinations(query?: string | City): void {
    const searchValue = query ?? this.searchForm.get('destination')?.value ?? '';

    this.filteredDestinations.set(this.filterCities(searchValue));
  }

  onOriginSelected(city: City): void {
    this.searchForm.patchValue(
      {
        originId: city.id,
        origin: city.label,
      },
      {
        emitEvent: false,
      },
    );
  }

  onDestinationSelected(city: City): void {
    this.searchForm.patchValue(
      {
        destinationId: city.id,
        destination: city.label,
      },
      {
        emitEvent: false,
      },
    );
  }

  showValidationsOnInvalid(): void {
    if (this.searchForm.hasError('sameCity')) {
      this.errorMessage.set('Origin and destination cannot be the same.');
    } else if (this.searchForm.hasError('invalidDateRange')) {
      this.errorMessage.set('Return date must be after departure date.');
    } else if (this.searchForm.hasError('invalidCitySelection')) {
      this.errorMessage.set('Please select cities from the suggested list.');
    } else {
      this.errorMessage.set('Please fill in all required fields.');
    }
    this.searchForm.markAllAsTouched();
  }

  search(): void {
    if (this.searchForm.invalid) {
      this.showValidationsOnInvalid();
      return;
    }

    const formValue = this.searchForm.getRawValue();

    const payload: FlightSearchCriteria = {
      originId: formValue.originId!,
      destinationId: formValue.destinationId!,
      departureDate: formValue.departureDate!,
      returnDate: formValue.roundTrip ? formValue.returnDate : null,
      passengers: Number(formValue.passengers ?? 1),
      roundTrip: !!formValue.roundTrip,
    };

    this.loading.set(true);
    this.errorMessage.set('');

    this.flightService
      .searchFlights(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (results) => {
          this.loading.set(false);

          //To preserve search criteria for later retrieval in results and booking pages, we save it in the service. This also allows us to restore the form state if user goes back to search page after executing a search.
          this.flightService.saveSearchCriteria(payload);
          this.flightService.saveFlightSearchResult(results);

          this.router.navigate(['/available-flights']);
        },
        error: () => {
          this.loading.set(false);

          this.errorMessage.set('Unable to retrieve flight offers. Please try again.');
        },
      });
  }

  getCityLabel(cityId: number | undefined, fallback: string): string {
    return getCityLabel(cityId, fallback);
  }

  private initializeListeners(): void {
    this.searchForm
      .get('roundTrip')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((checked) => {
        const isChecked = Boolean(checked);
        this.isRoundTrip.set(isChecked);
        this.toggleRoundTrip(isChecked);
      });

    this.initializeCityListener('origin', 'originId', (value) => this.filterOrigins(value));

    this.initializeCityListener('destination', 'destinationId', (value) =>
      this.filterDestinations(value),
    );
  }

  private initializeCityListener(
    controlName: 'origin' | 'destination',
    idControlName: 'originId' | 'destinationId',
    filterFn: (value: string | City) => void,
  ): void {
    this.searchForm
      .get(controlName)
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const selectedCity = this.cities.find((city) => city.label === value);

        if (!selectedCity) {
          this.searchForm.patchValue(
            {
              [idControlName]: null,
            },
            {
              emitEvent: false,
            },
          );
        }

        filterFn(value ?? '');
      });
  }

  private toggleRoundTrip(checked: boolean): void {
    const returnDateControl = this.searchForm.get('returnDate');

    if (checked) {
      returnDateControl?.enable();
      returnDateControl?.setValidators(Validators.required);
      returnDateControl?.updateValueAndValidity();

      return;
    }

    returnDateControl?.clearValidators();
    returnDateControl?.setValue(null);
    returnDateControl?.disable();
    returnDateControl?.updateValueAndValidity();
  }

  private filterCities(query: string | City): City[] {
    const searchText = typeof query === 'string' ? query : (query?.label ?? '');

    const normalizedQuery = searchText.toLowerCase().trim();

    return normalizedQuery
      ? this.cities.filter((city) => city.label.toLowerCase().includes(normalizedQuery))
      : [...this.cities];
  }

  private validateSelectedCities(control: AbstractControl): ValidationErrors | null {
    const origin = control.get('origin')?.value;
    const destination = control.get('destination')?.value;
    const originId = control.get('originId')?.value;
    const destinationId = control.get('destinationId')?.value;

    if ((origin && !originId) || (destination && !destinationId)) {
      return {
        invalidCitySelection: true,
      };
    }

    return null;
  }

  swapCities(): void {
    const origin = this.searchForm.get('origin')?.value;
    const destination = this.searchForm.get('destination')?.value;
    const originId = this.searchForm.get('originId')?.value;
    const destinationId = this.searchForm.get('destinationId')?.value;

    this.searchForm.patchValue({
      origin: destination,
      destination: origin,
      originId: destinationId,
      destinationId: originId,
    });

    this.filterOrigins();
    this.filterDestinations();
  }
}
