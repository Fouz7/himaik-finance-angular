import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {AuthServices} from '../../services/auth-services';
import {CommonModule} from '@angular/common';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {toSignal} from '@angular/core/rxjs-interop';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss'
})
export class LoginPage implements OnInit, OnDestroy {
  credentials = {
    username: '',
    password: ''
  };
  isLoading = false;

  private breakpointObserver = inject(BreakpointObserver);
  private authService = inject(AuthServices);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private mql?: MediaQueryList;
  private _isLandscape = false;

  private readonly onMqlChange = (e: MediaQueryListEvent) => {
    this._isLandscape = e.matches;
  };

  ngOnInit(): void {
    this.mql = window.matchMedia('(orientation: landscape)');
    this._isLandscape = this.mql.matches;

    if (this.mql.addEventListener) {
      this.mql.addEventListener('change', this.onMqlChange);
    } else {
      (this.mql as any).addListener(this.onMqlChange);
    }
  }

  isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

  isLandscape(): boolean {
    return this._isLandscape;
  }

  onLogin() {
    this.isLoading = true;
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          horizontalPosition: "center",
          verticalPosition: "top"
        });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
          horizontalPosition: "center",
          verticalPosition: "top"
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
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
