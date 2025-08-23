import {Component, input, InputSignal, signal} from '@angular/core';
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
  expandable: InputSignal<boolean> = input<boolean>(false);
  imageSrc: InputSignal<string | undefined> = input<string | undefined>(undefined);
  expanded = signal(false);

  onCardClick() {
    if (this.expandable()) {
      this.expanded.update(v => !v);
    }
  }

}
