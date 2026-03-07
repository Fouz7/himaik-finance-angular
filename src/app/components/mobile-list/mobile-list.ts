import { Component, input, output, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { Income } from '../../services/income-service';
import { Outcome } from '../../services/transaction-service';

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

  loadMore = output<'income' | 'outcome'>();

  @ViewChildren('viewport') viewports!: QueryList<ElementRef>;

  onScroll(event: Event, type: 'income' | 'outcome') {
    const target = event.currentTarget as HTMLElement;
    // adding a 100px threshold so fetching triggers smoothly before absolute bottom
    const currentScrollBottom = Math.ceil(target.scrollTop) + target.clientHeight;
    const isAtBottom = currentScrollBottom >= target.scrollHeight - 100;

    if (isAtBottom) {
      if (type === 'income' && this.incomeHasMore() && !this.loadingIncome()) {
        this.loadMore.emit(type);
      } else if (type === 'outcome' && this.outcomeHasMore() && !this.loadingOutcome()) {
        this.loadMore.emit(type);
      }
    }
  }

  getTransactionAmount(item: Outcome): number {
    return Number(item.debit) || Number(item.credit);
  }

  getTransactionClass(item: Outcome): string {
    return Number(item.debit) > 0 ? 'outcome' : 'income';
  }
}
