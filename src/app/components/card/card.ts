import { Component, input, InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.scss'
})
export class Card {
  cardTitle: InputSignal<string> = input.required<string>();
  cardBody: InputSignal<any> = input();
  cardType: InputSignal<string> = input<string>('');
}
