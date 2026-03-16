import { Component, input, output, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Income } from '../../services/income-service';
import { Outcome } from '../../services/transaction-service';

type MobileRowActionRequest =
  | {
      type: 'income';
      item: Income;
      clientX: number;
      clientY: number;
    }
  | {
      type: 'transaction';
      item: Outcome;
      clientX: number;
      clientY: number;
    };

@Component({
  selector: 'app-mobile-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTabGroup,
    MatTab,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './mobile-list.html',
  styleUrls: ['./mobile-list.scss']
})
export class MobileList {
  readonly readonlyIncomeTooltip = 'Auto-generated from income and cannot be updated or deleted.';
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
  rowActionRequested = output<MobileRowActionRequest>();

  @ViewChildren('viewport') viewports!: QueryList<ElementRef>;

  onScroll(event: Event, type: 'income' | 'outcome') {
    const target = event.currentTarget as HTMLElement;
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

  isReadonlyIncomeTransaction(item: Outcome): boolean {
    return Number(item.credit) > 0 && Number(item.debit) === 0;
  }

  selectedTabIndex = 0;
  private touchStartX = 0;
  private touchEndX = 0;
  private touchStartY = 0;
  private touchEndY = 0;
  private longPressTimeoutId?: ReturnType<typeof setTimeout>;
  private longPressTriggered = false;
  private pressStartX = 0;
  private pressStartY = 0;
  private readonly longPressDelay = 450;
  private readonly longPressMoveThreshold = 10;

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
    this.touchStartY = event.changedTouches[0].screenY;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.touchEndY = event.changedTouches[0].screenY;
    this.handleSwipe();
  }

  onItemTouchStart(event: TouchEvent, type: 'income' | 'transaction', item: Income | Outcome) {
    if (type === 'transaction' && this.isReadonlyIncomeTransaction(item as Outcome)) {
      this.clearLongPressTimeout();
      return;
    }

    const touch = event.changedTouches[0];
    this.longPressTriggered = false;
    this.pressStartX = touch.clientX;
    this.pressStartY = touch.clientY;
    this.clearLongPressTimeout();
    this.longPressTimeoutId = setTimeout(() => {
      this.longPressTriggered = true;
      if (type === 'income') {
        this.rowActionRequested.emit({
          type: 'income',
          item: item as Income,
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        return;
      }

      this.rowActionRequested.emit({
        type: 'transaction',
        item: item as Outcome,
        clientX: touch.clientX,
        clientY: touch.clientY
      });
    }, this.longPressDelay);
  }

  onItemTouchMove(event: TouchEvent) {
    const touch = event.changedTouches[0];
    const movedX = Math.abs(touch.clientX - this.pressStartX);
    const movedY = Math.abs(touch.clientY - this.pressStartY);

    if (movedX > this.longPressMoveThreshold || movedY > this.longPressMoveThreshold) {
      this.clearLongPressTimeout();
    }
  }

  onItemTouchEnd() {
    this.clearLongPressTimeout();
  }

  onItemContextMenu(event: MouseEvent, type: 'income' | 'transaction', item: Income | Outcome) {
    event.preventDefault();

    if (type === 'transaction' && this.isReadonlyIncomeTransaction(item as Outcome)) {
      return;
    }

    if (type === 'income') {
      this.rowActionRequested.emit({
        type: 'income',
        item: item as Income,
        clientX: event.clientX,
        clientY: event.clientY
      });
      return;
    }

    this.rowActionRequested.emit({
      type: 'transaction',
      item: item as Outcome,
      clientX: event.clientX,
      clientY: event.clientY
    });
  }

  handleSwipe() {
    if (this.longPressTriggered) {
      this.longPressTriggered = false;
      return;
    }

    const xDiff = this.touchStartX - this.touchEndX;
    const yDiff = this.touchStartY - this.touchEndY;
    const swipeThreshold = 50;

    if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > swipeThreshold) {
      if (xDiff > 0) {
        if (this.selectedTabIndex === 0) {
          this.selectedTabIndex = 1;
        }
      } else {
        if (this.selectedTabIndex === 1) {
          this.selectedTabIndex = 0;
        }
      }
    }
  }

  private clearLongPressTimeout() {
    if (this.longPressTimeoutId) {
      clearTimeout(this.longPressTimeoutId);
      this.longPressTimeoutId = undefined;
    }
  }
}
