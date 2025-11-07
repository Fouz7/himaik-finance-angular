import {Component, inject, WritableSignal, signal, Signal, OnInit, OnDestroy} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AuthServices} from '../../services/auth-services';
import {Income, IncomeService} from '../../services/income-service';
import {Outcome, TransactionService} from '../../services/transaction-service';
import {Header} from '../../components/header/header';
import {forkJoin, Observable} from 'rxjs';
import {CommonModule} from '@angular/common';
import {BalanceService} from '../../services/balance-service';
import {MatIcon} from '@angular/material/icon';
import {IncomeTableComponent} from '../../components/income-table/income-table';
import {OutcomeTableComponent} from '../../components/outcome-table/outcome-table';
import {InputDialog} from '../../components/input-dialog/input-dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';
import {MobileList} from '../../components/mobile-list/mobile-list';
import {Card} from '../../components/card/card';
import {Balance} from '../../components/balance/balance';
import {MatFabButton} from '@angular/material/button';
import {EvidenceDialog} from '../../components/evidence-dialog/evidence-dialog';
import {UploadEvidenceDialog} from '../../components/upload-evidence-dialog/upload-evidence-dialog';
import {ConfirmationDialog} from '../../components/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    Header,
    CommonModule,
    Card,
    MatIcon,
    IncomeTableComponent,
    OutcomeTableComponent,
    InputDialog,
    MatProgressSpinnerModule,
    MobileList,
    Balance,
    MatFabButton
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage implements OnInit, OnDestroy {
  private authService = inject(AuthServices);
  private balanceService = inject(BalanceService);
  private dialog = inject(MatDialog);
  private incomeService = inject(IncomeService);
  private transactionService = inject(TransactionService);
  private snackBar = inject(MatSnackBar);
  private breakpointObserver = inject(BreakpointObserver);
  private mql?: MediaQueryList;
  private _isLandscape = false;

  private readonly onMqlChange = (e: MediaQueryListEvent) => {
    this._isLandscape = e.matches;
  };

  showDialog = false;
  dialogType: 'income' | 'transaction' = 'income';
  isLoading = signal(true);

  isLoggedIn$: Observable<boolean> = this.authService.isLoggedIn$;
  balance: WritableSignal<any | undefined> = signal(undefined);
  totalIncome: WritableSignal<any | undefined> = signal(undefined);
  totalOutcome: WritableSignal<any | undefined> = signal(undefined);
  balanceEvidence: Signal<any | undefined> = toSignal(this.balanceService.showBalanceEvidence());

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

  constructor() {
    forkJoin({
      balance: this.balanceService.getBalance(),
      totalIncome: this.balanceService.getTotalIncome(),
      totalOutcome: this.balanceService.getTotalOutcome()
    }).subscribe({
      next: (data) => {
        this.balance.set(data.balance);
        this.totalIncome.set(data.totalIncome);
        this.totalOutcome.set(data.totalOutcome);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching dashboard data:', err);
        this.isLoading.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.mql = window.matchMedia('(orientation: landscape)');
    this._isLandscape = this.mql.matches;

    if (this.mql.addEventListener) {
      this.mql.addEventListener('change', this.onMqlChange);
    } else {
      (this.mql as any).addListener(this.onMqlChange);
    }

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

  onLogout() {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'Konfirmasi Logout',
        message: 'Are you sure you want to logout?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authService.logout();
      }
    });
  }

  openDialog(type: 'income' | 'transaction') {
    this.dialogType = type;
    this.showDialog = true;
  }

  onDialogClose() {
    this.showDialog = false;
  }

  onDialogSubmit(result: any) {
    const isIncome = this.dialogType === 'income';
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: `Konfirmasi ${isIncome ? 'Pendapatan' : 'Transaksi'}`,
        message: `Are you sure you want to add this ${isIncome ? 'income' : 'transaction'}?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        if (isIncome) {
          this.incomeService.addIncome(result).subscribe(() => {
            location.reload();
          });
        } else {
          this.transactionService.addTransaction(result).subscribe(() => {
            location.reload();
          });
        }
      }
    });

    this.showDialog = false;
  }

  openBalanceEvidenceDialog(): void {
    const url = this.balanceEvidence()?.url;
    if (!url) return;
    this.dialog.open(EvidenceDialog, {
      data: {imageUrl: url}
    });
  }

  updateEvidence(): void {
    const ref = this.dialog.open(UploadEvidenceDialog, {
      width: '520px',
      disableClose: true
    });
    ref.afterClosed().subscribe(() => {
    });
  }

  openUploadEvidenceDialog(): void {
    this.updateEvidence();
  }

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
        this.mobileIncomePage.update((page: number) => page + 1);
      } else if (event.direction === 'prev' && this.mobileIncomePage() > 1) {
        this.mobileIncomePage.update((page: number) => page - 1);
      }
      this.loadMobileIncomes();
    } else {
      if (event.direction === 'next' && this.mobileOutcomeHasMore()) {
        this.mobileOutcomePage.update((page: number) => page + 1);
      } else if (event.direction === 'prev' && this.mobileOutcomePage() > 1) {
        this.mobileOutcomePage.update((page: number) => page - 1);
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

