import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthServices } from '../services/auth-services';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private authService: AuthServices, private router: Router) { }

  canActivate(): boolean {
    const token = this.authService.getToken();
    if (token) {
      this.router.navigate(['/dashboard']);
      return false;
    } else {
      return true;
    }
  }
}
