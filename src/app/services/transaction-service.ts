import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@env/environment';
import {Observable} from 'rxjs';

export interface Outcome {
  transactionId: number;
  debit: string;
  credit: string;
  balance: string;
  notes: string;
  createdBy: string;
  createdAt: Date;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse {
  data: Outcome[];
  pagination: Pagination;
}


@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getOutcomes(page: number, limit: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/transactions`, {
      params: {
        page: page.toString(),
        limit: limit.toString()
      }
    });
  }

  addTransaction(data: { nominal: number; notes: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/transactions`, data);
  }
}
