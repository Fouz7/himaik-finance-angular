import { Injectable } from '@angular/core';
import { environment} from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getBalance(): Observable<any> {
    return this.http.get(`${this.apiUrl}/balance`);
  }

  getTotalIncome(): Observable<any> {
    return this.http.get(`${this.apiUrl}/balance/income`);
  }

  getTotalOutcome(): Observable<any> {
    return this.http.get(`${this.apiUrl}/balance/outcome`);
  }
}
