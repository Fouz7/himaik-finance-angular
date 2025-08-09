import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {Income, IncomeService} from '../../services/income-service';
import {Outcome, TransactionService} from '../../services/transaction-service';

@Component({
  selector: 'app-mobile-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTabGroup,
    MatTab,
    MatIconModule,
  ],
  templateUrl: './mobile-list.html',
  styleUrls: ['./mobile-list.scss']
})
export class MobileList implements OnInit {
  private incomeService = inject(IncomeService);
  private transactionService = inject(TransactionService);

  incomes: Income[] = [];
  outcomes: Outcome[] = [];

  incomePage = 1;
  outcomePage = 1;
  incomeHasMore = true;
  outcomeHasMore = true;
  private readonly pageSize = 5;
  loadingIncome = false;
  loadingOutcome = false;

  ngOnInit() {
    this.loadIncomes();
    this.loadOutcomes();
  }

  loadIncomes() {
    if (this.loadingIncome) return;
    this.loadingIncome = true;

    this.incomeService.getIncomes(this.incomePage, this.pageSize).subscribe(response => {
      this.incomes = response.data;
      this.incomeHasMore = (this.incomePage * this.pageSize) < response.pagination.totalItems;
      this.loadingIncome = false;
    });
  }

  loadOutcomes() {
    if (this.loadingOutcome) return;
    this.loadingOutcome = true;

    this.transactionService.getOutcomes(this.outcomePage, this.pageSize).subscribe(response => {
      this.outcomes = response.data;
      this.outcomeHasMore = (this.outcomePage * this.pageSize) < response.pagination.totalItems;
      this.loadingOutcome = false;
    });
  }

  navigate(type: 'income' | 'outcome', direction: 'prev' | 'next') {
    if (type === 'income') {
      if (direction === 'next' && this.incomeHasMore) {
        this.incomePage++;
      } else if (direction === 'prev' && this.incomePage > 1) {
        this.incomePage--;
      }
      this.loadIncomes();
    } else {
      if (direction === 'next' && this.outcomeHasMore) {
        this.outcomePage++;
      } else if (direction === 'prev' && this.outcomePage > 1) {
        this.outcomePage--;
      }
      this.loadOutcomes();
    }
  }

  getTransactionAmount(item: Outcome): number {
    return Number(item.debit) || Number(item.credit);
  }

  getTransactionClass(item: Outcome): string {
    return Number(item.debit) > 0 ? 'outcome' : 'income';
  }
}
