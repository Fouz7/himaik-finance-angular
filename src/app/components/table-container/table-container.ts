import { Component, computed, input, output, signal } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { Income } from '../../services/income-service';
import { Outcome } from '../../services/transaction-service';
import { PageEvent } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-table-container',
  standalone: true,
  imports: [
    MatTabGroup,
    MatTab,
    MatTableModule,
    CommonModule,
    MatIcon
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

  incomePageSize = 10;
  outcomePageSize = 10;

  incomeCurrentPage = signal<number>(1);
  outcomeCurrentPage = signal<number>(1);

  incomeTotalPages = computed(() => Math.ceil(this.totalIncomes() / this.incomePageSize) || 1);
  outcomeTotalPages = computed(() => Math.ceil(this.totalOutcomes() / this.outcomePageSize) || 1);

  prevIncomePage() {
    if (this.incomeCurrentPage() > 1) {
      this.incomeCurrentPage.update(p => p - 1);
      this.emitIncomePage();
    }
  }

  nextIncomePage() {
    if (this.incomeCurrentPage() < this.incomeTotalPages()) {
      this.incomeCurrentPage.update(p => p + 1);
      this.emitIncomePage();
    }
  }

  private emitIncomePage() {
    this.incomePageChange.emit({
      pageIndex: this.incomeCurrentPage() - 1,
      pageSize: this.incomePageSize,
      length: this.totalIncomes()
    } as PageEvent);
  }

  prevOutcomePage() {
    if (this.outcomeCurrentPage() > 1) {
      this.outcomeCurrentPage.update(p => p - 1);
      this.emitOutcomePage();
    }
  }

  nextOutcomePage() {
    if (this.outcomeCurrentPage() < this.outcomeTotalPages()) {
      this.outcomeCurrentPage.update(p => p + 1);
      this.emitOutcomePage();
    }
  }

  private emitOutcomePage() {
    this.outcomePageChange.emit({
      pageIndex: this.outcomeCurrentPage() - 1,
      pageSize: this.outcomePageSize,
      length: this.totalOutcomes()
    } as PageEvent);
  }
}
