import { Component, computed, input, InputSignal } from '@angular/core';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-balance',
  imports: [
    NgClass
  ],
  templateUrl: './balance.html',
  styleUrl: './balance.scss'
})
export class Balance {
  type: InputSignal<string | undefined> = input();
  nominal: InputSignal<string | number | undefined> = input();
  title: InputSignal<string | undefined> = input();

  readonly currencyPrefix = computed(() => {
    const nominal = String(this.nominal() ?? '').trim();
    const match = nominal.match(/^([^\d-]+)\s*(.*)$/);
    return match?.[1]?.trim() ?? '';
  });

  readonly numericValue = computed(() => {
    const nominal = String(this.nominal() ?? '').trim();
    const match = nominal.match(/^([^\d-]+)\s*(.*)$/);
    return (match?.[2] ?? nominal).trim();
  });
}
