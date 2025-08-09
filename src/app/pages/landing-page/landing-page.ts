import {Component, inject, Signal} from '@angular/core';
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
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {MobileList} from '../../components/mobile-list/mobile-list';

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
export class LandingPage {
  private balanceService = inject(BalanceService);
  private authService = inject(AuthServices);
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);

  isLoggedIn$: Observable<boolean> = this.authService.isLoggedIn$;
  balance: Signal<any | undefined> = toSignal(this.balanceService.getBalance());
  totalIncome: Signal<any | undefined> = toSignal(this.balanceService.getTotalIncome());
  totalOutcome: Signal<any | undefined> = toSignal(this.balanceService.getTotalOutcome());

  isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

  onLogin() {
    this.router.navigate(['/login']);
  }
}
