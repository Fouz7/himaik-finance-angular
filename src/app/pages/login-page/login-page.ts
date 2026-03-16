import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthServices } from '../../services/auth-services';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { extractApiErrorMessage } from '../../Utils/api-error';

const LOGIN_SNACKBAR_POSITION = {
  horizontalPosition: 'right' as const,
  verticalPosition: 'bottom' as const
};

const LOGIN_SUCCESS_SNACKBAR_DURATION = 1800;
const LOGIN_ERROR_SNACKBAR_DURATION = 2800;

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    FormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss'
})
export class LoginPage {
  credentials = {
    username: '',
    password: ''
  };
  isLoading = false;

  private authService = inject(AuthServices);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  onLogin() {
    this.isLoading = true;
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Login successful!', 'Close', {
          duration: LOGIN_SUCCESS_SNACKBAR_DURATION,
          panelClass: ['success-snackbar'],
          ...LOGIN_SNACKBAR_POSITION
        });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = extractApiErrorMessage(err, 'Login failed. Please check your credentials.');
        this.snackBar.open(errorMessage, 'Close', {
          duration: LOGIN_ERROR_SNACKBAR_DURATION,
          panelClass: ['error-snackbar'],
          ...LOGIN_SNACKBAR_POSITION
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
