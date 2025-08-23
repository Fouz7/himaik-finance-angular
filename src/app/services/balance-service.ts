import {Injectable} from '@angular/core';
import {environment} from '@env/environment';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {startWith, switchMap, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  private apiUrl = environment.apiUrl;
  private evidenceRefresh$ = new Subject<void>();

  constructor(private http: HttpClient) {
  }

  getBalance(): Observable<any> {
    return this.http.get(`${this.apiUrl}/balance`);
  }

  getTotalIncome(): Observable<any> {
    return this.http.get(`${this.apiUrl}/balance/income`);
  }

  getTotalOutcome(): Observable<any> {
    return this.http.get(`${this.apiUrl}/balance/outcome`);
  }

  showBalanceEvidence(): Observable<{ url: string }> {
    return this.evidenceRefresh$.pipe(
      startWith(void 0),
      switchMap(() => this.http.get<{ url: string }>(`${this.apiUrl}/balance/evidence/latest`))
    );
  }

  refreshEvidence(): void {
    this.evidenceRefresh$.next();
  }

  uploadBalanceEvidence(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(
      `${this.apiUrl}/balance/evidence`,
      formData
    ).pipe(
      tap(() => this.refreshEvidence())
    );
  }
}
