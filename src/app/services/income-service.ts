import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment} from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Income {
  id: number;
  name: string;
  nominal: string;
  transfer_date: string;
  createdBy: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse {
  data: Income[];
  pagination: Pagination;
}

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getIncomes(page: number, limit: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/incomes`, {
      params: {
        page: page.toString(),
        limit: limit.toString()
      }
    });
  }

  addIncome(data: { name: string; nominal: number; transfer_date: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/incomes`, data);
  }

}
