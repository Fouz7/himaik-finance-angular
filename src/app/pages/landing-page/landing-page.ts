import {Component, inject, OnDestroy, OnInit, Signal, signal} from '@angular/core';
import {Header} from '../../components/header/header';
import {Card} from '../../components/card/card';
import {BalanceService} from '../../services/balance-service';
import {toSignal} from '@angular/core/rxjs-interop';
import {CommonModule} from '@angular/common';
import {TableContainer} from '../../components/table-container/table-container';
import {AuthServices} from '../../services/auth-services';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {MobileList} from '../../components/mobile-list/mobile-list';
import {Income, IncomeService} from '../../services/income-service';
import {Outcome, TransactionService} from '../../services/transaction-service';
import {PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    Header,
    Card,
    CommonModule,
    TableContainer,
    MobileList,
  ],
  templateUrl: './landing-page.html',
  styleUrls: [
    './landing-page.scss',
    './landing-page-mobile.scss'
  ]
})
export class LandingPage implements OnInit, OnDestroy {
  private balanceService = inject(BalanceService);
  private authService = inject(AuthServices);
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);
  private incomeService = inject(IncomeService);
  private transactionService = inject(TransactionService);
  private mql?: MediaQueryList;
  private _isLandscape = false;

  private readonly onMqlChange = (e: MediaQueryListEvent) => {
    this._isLandscape = e.matches;
  };


  isLoggedIn$: Observable<boolean> = this.authService.isLoggedIn$;
  balance: Signal<any | undefined> = toSignal(this.balanceService.getBalance());
  totalIncome: Signal<any | undefined> = toSignal(this.balanceService.getTotalIncome());
  totalOutcome: Signal<any | undefined> = toSignal(this.balanceService.getTotalOutcome());
  balanceEvidence: Signal<any | undefined> = toSignal(this.balanceService.showBalanceEvidence());

  incomeData = signal<Income[]>([]);
  totalIncomes = signal<number>(0);
  outcomeData = signal<Outcome[]>([]);
  totalOutcomes = signal<number>(0);
  isTableLoading = signal<boolean>(true);

  mobileIncomes = signal<Income[]>([]);
  mobileOutcomes = signal<Outcome[]>([]);
  mobileIncomePage = signal<number>(1);
  mobileOutcomePage = signal<number>(1);
  mobileIncomeHasMore = signal<boolean>(true);
  mobileOutcomeHasMore = signal<boolean>(true);
  mobileLoadingIncome = signal<boolean>(false);
  mobileLoadingOutcome = signal<boolean>(false);
  isMobileListLoading = signal<boolean>(true);
  private readonly mobilePageSize = 5;

  ngOnInit(): void {
    this.mql = window.matchMedia('(orientation: landscape)');
    this._isLandscape = this.mql.matches;

    if (this.mql.addEventListener) {
      this.mql.addEventListener('change', this.onMqlChange);
    } else {
      (this.mql as any).addListener(this.onMqlChange);
    }
    this.loadIncomes(1, 5);
    this.loadOutcomes(1, 5);
    this.loadMobileIncomes();
    this.loadMobileOutcomes();
  }

  isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(map(result => result.matches)),
    {initialValue: false}
  );

  isLandscape(): boolean {
    return this._isLandscape;
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

  onIncomePageChange(event: PageEvent) {
    this.loadIncomes(event.pageIndex + 1, event.pageSize);
  }

  onOutcomePageChange(event: PageEvent) {
    this.loadOutcomes(event.pageIndex + 1, event.pageSize);
  }

  private loadIncomes(page: number, limit: number) {
    this.incomeService.getIncomes(page, limit).subscribe(response => {
      this.totalIncomes.set(response.pagination.totalItems);
      this.incomeData.set(response.data);
      this.checkLoadingComplete();
    });
  }

  private loadOutcomes(page: number, limit: number) {
    this.transactionService.getOutcomes(page, limit).subscribe(response => {
      this.totalOutcomes.set(response.pagination.totalItems);
      this.outcomeData.set(response.data);
      this.checkLoadingComplete();
    });
  }

  private checkLoadingComplete() {
    if (this.incomeData().length > 0 && this.outcomeData().length > 0) {
      this.isTableLoading.set(false);
    }
  }

  // Mobile list methods
  loadMobileIncomes() {
    if (this.mobileLoadingIncome()) return;
    this.mobileLoadingIncome.set(true);

    this.incomeService.getIncomes(this.mobileIncomePage(), this.mobilePageSize).subscribe(response => {
      this.mobileIncomes.set(response.data);
      this.mobileIncomeHasMore.set((this.mobileIncomePage() * this.mobilePageSize) < response.pagination.totalItems);
      this.mobileLoadingIncome.set(false);
      this.checkMobileListLoadingComplete();
    });
  }

  loadMobileOutcomes() {
    if (this.mobileLoadingOutcome()) return;
    this.mobileLoadingOutcome.set(true);

    this.transactionService.getOutcomes(this.mobileOutcomePage(), this.mobilePageSize).subscribe(response => {
      this.mobileOutcomes.set(response.data);
      this.mobileOutcomeHasMore.set((this.mobileOutcomePage() * this.mobilePageSize) < response.pagination.totalItems);
      this.mobileLoadingOutcome.set(false);
      this.checkMobileListLoadingComplete();
    });
  }

  onMobileNavigate(event: { type: 'income' | 'outcome', direction: 'prev' | 'next' }) {
    if (event.type === 'income') {
      if (event.direction === 'next' && this.mobileIncomeHasMore()) {
        this.mobileIncomePage.update(page => page + 1);
      } else if (event.direction === 'prev' && this.mobileIncomePage() > 1) {
        this.mobileIncomePage.update(page => page - 1);
      }
      this.loadMobileIncomes();
    } else {
      if (event.direction === 'next' && this.mobileOutcomeHasMore()) {
        this.mobileOutcomePage.update(page => page + 1);
      } else if (event.direction === 'prev' && this.mobileOutcomePage() > 1) {
        this.mobileOutcomePage.update(page => page - 1);
      }
      this.loadMobileOutcomes();
    }
  }

  private checkMobileListLoadingComplete() {
    if (this.mobileIncomes().length > 0 && this.mobileOutcomes().length > 0) {
      this.isMobileListLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    if (!this.mql) return;
    if (this.mql.removeEventListener) {
      this.mql.removeEventListener('change', this.onMqlChange);
    } else {
      (this.mql as any).addListener(this.onMqlChange);
    }
  }
}
