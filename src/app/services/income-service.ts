import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment} from '@env/environment';
import { Observable } from 'rxjs';

export interface Income {
  id: number;
  name: string;
  nominal: string;
  transfer_date: string;
  createdBy: string;
}

export interface IncomePayload {
  name: string;
  nominal: number;
  transfer_date: string;
}

export interface UpdateIncomePayload {
  name?: string;
  nominal?: number;
  transfer_date?: string;
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

  addIncome(data: IncomePayload): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/incomes`, data);
  }

  updateIncome(id: number, data: UpdateIncomePayload): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/incomes/${id}`, data);
  }

  deleteIncome(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/incomes/${id}`);
  }

}
