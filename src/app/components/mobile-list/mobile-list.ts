import {Component, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {Income} from '../../services/income-service';
import {Outcome} from '../../services/transaction-service';

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
export class MobileList {
  incomes = input<Income[]>([]);
  outcomes = input<Outcome[]>([]);
  incomePage = input<number>(1);
  outcomePage = input<number>(1);
  incomeHasMore = input<boolean>(true);
  outcomeHasMore = input<boolean>(true);
  loadingIncome = input<boolean>(false);
  loadingOutcome = input<boolean>(false);
  isLoading = input<boolean>(true);

  navigate = output<{ type: 'income' | 'outcome', direction: 'prev' | 'next' }>();

  onNavigate(type: 'income' | 'outcome', direction: 'prev' | 'next') {
    this.navigate.emit({type, direction});
  }

  getTransactionAmount(item: Outcome): number {
    return Number(item.debit) || Number(item.credit);
  }

  getTransactionClass(item: Outcome): string {
    return Number(item.debit) > 0 ? 'outcome' : 'income';
  }
}
