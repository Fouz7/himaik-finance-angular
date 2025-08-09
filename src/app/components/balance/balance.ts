import { Component, input, InputSignal } from '@angular/core';
import {NgClass} from '@angular/common';


@Component({
  selector: 'app-balance',
  imports: [
    NgClass
  ],
  templateUrl: './balance.html',
  styleUrl: './balance.scss'
})
export class Balance {
  type: InputSignal<any> = input();
  nominal: InputSignal<any> = input();
  title: InputSignal<any> = input();
}
