import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Country } from '../common/country';
import { HttpClient } from '@angular/common/http';
import { State } from '../common/state';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopFormService {

  private apiUrl = environment.myShopApiUrl;

  constructor(private httpClient: HttpClient) { }

  getCreditCardMonths(startMonth: number): Observable<number[]> {
    let data: number[] = [];

    // loop from input month to december
    for (let month = startMonth; month <= 12; month++) {
      data.push(month);
    }

    return of(data);
  }

  getCreditCardYears(startYear: number): Observable<number[]> {
    let data: number[] = [];
    data.push(startYear);
    // loop from current year to +10 year
    for (let x = 1; x < 10; x++) {
      startYear++;
      data.push(startYear);
    }

    return of(data);
  }

  getCountries(): Observable<Country[]> {
    const searchUrl = `${this.apiUrl}/countries`;
    return this.httpClient.get<GetResponseCountries>(searchUrl)
    .pipe(
      map(response => response._embedded.countries)
    );
  }

  getStates(countryCode: string): Observable<State[]>{
    const searchUrl = `${this.apiUrl}/states/search/findByCountryCode?code=${countryCode}`;
    return this.httpClient.get<GetResponseStates>(searchUrl)
    .pipe(
      map(response => response._embedded.states)
    )
  }

}

interface GetResponseCountries {
  _embedded: {
    countries: Country[];
  };
}

interface GetResponseStates {
  _embedded:{
    states: State[];
  };
}
