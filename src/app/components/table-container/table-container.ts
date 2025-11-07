import {Component, input, output} from '@angular/core';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatTableModule} from '@angular/material/table';
import {CommonModule} from '@angular/common';
import {Income} from '../../services/income-service';
import {Outcome} from '../../services/transaction-service';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'app-table-container',
  standalone: true,
  imports: [
    MatTabGroup,
    MatTab,
    MatTableModule,
    CommonModule,
    MatPaginatorModule
  ],
  templateUrl: './table-container.html',
  styleUrl: './table-container.scss'
})
export class TableContainer {
  incomeData = input<Income[]>([]);
  totalIncomes = input<number>(0);
  outcomeData = input<Outcome[]>([]);
  totalOutcomes = input<number>(0);
  isLoading = input<boolean>(true);

  incomePageChange = output<PageEvent>();
  outcomePageChange = output<PageEvent>();

  incomeDisplayedColumns: string[] = ['name', 'nominal', 'transfer_date', 'createdBy'];
  outcomeDisplayedColumns: string[] = ['notes', 'debit', 'credit', 'createdBy', 'createdAt'];

  onIncomePageChange(event: PageEvent) {
    this.incomePageChange.emit(event);
  }

  onOutcomePageChange(event: PageEvent) {
    this.outcomePageChange.emit(event);
  }
}
