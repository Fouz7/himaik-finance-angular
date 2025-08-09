import {Component, inject, WritableSignal, signal} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AuthServices} from '../../services/auth-services';
import {IncomeService} from '../../services/income-service';
import {TransactionService} from '../../services/transaction-service';
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
import {ConfirmationDialog} from '../../components/confirmation-dialog/confirmation-dialog';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';
import {MobileList} from '../../components/mobile-list/mobile-list';
import {Card} from '../../components/card/card';
import {Balance} from '../../components/balance/balance';
import {MatFabButton} from '@angular/material/button';

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
    ConfirmationDialog,
    MobileList,
    Balance,
    MatFabButton
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage {
  private authService = inject(AuthServices);
  private balanceService = inject(BalanceService);
  private dialog = inject(MatDialog);
  private incomeService = inject(IncomeService);
  private transactionService = inject(TransactionService);
  private snackBar = inject(MatSnackBar);
  private breakpointObserver = inject(BreakpointObserver);

  showDialog = false;
  dialogType: 'income' | 'transaction' = 'income';
  isLoading = signal(true);

  isLoggedIn$: Observable<boolean> = this.authService.isLoggedIn$;
  balance: WritableSignal<any | undefined> = signal(undefined);
  totalIncome: WritableSignal<any | undefined> = signal(undefined);
  totalOutcome: WritableSignal<any | undefined> = signal(undefined);

  isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(map(result => result.matches)),
    {initialValue: false}
  );

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
}
