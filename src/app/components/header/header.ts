import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatIconModule,
    MatIconButton
],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  @Input() isLoggedIn: boolean | null = false;
  @Output() buttonClick = new EventEmitter<void>();

  onButtonClick() {
    this.buttonClick.emit();
  }
}
