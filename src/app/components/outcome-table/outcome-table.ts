import { Component, OnInit, ViewChild, inject, output } from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {CommonModule} from '@angular/common';
import {Outcome, TransactionService} from '../../services/transaction-service';
import {MatIcon} from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-outcome-table',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, CommonModule, MatIcon, MatTooltipModule],
  templateUrl: './outcome-table.html',
  styleUrl: './outcome-table.scss'
})
export class OutcomeTableComponent implements OnInit {
  private transactionService = inject(TransactionService);
  readonly readonlyIncomeTooltip = 'Auto-generated from income and cannot be updated or deleted.';
  readonly rowActionRequested = output<{
    type: 'transaction';
    item: Outcome;
    clientX: number;
    clientY: number;
  }>();

  displayedColumns: string[] = ['notes', 'debit', 'credit', 'createdBy', 'createdAt'];
  dataSource = new MatTableDataSource<Outcome>();
  total = 0;
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.loadData();
  }

  refreshCurrentPage() {
    this.loadData();
  }

  loadData() {
    this.transactionService.getOutcomes(this.currentPage, this.pageSize).subscribe(response => {
      this.total = response.pagination.totalItems;
      this.totalPages = Math.max(1, response.pagination.totalPages || Math.ceil(this.total / this.pageSize));

      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
        this.loadData();
        return;
      }

      this.dataSource.data = response.data;
    });
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadData();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadData();
    }
  }

  isReadonlyIncomeRow(row: Outcome): boolean {
    return Number(row.credit) > 0 && Number(row.debit) === 0;
  }

  onRowContextMenu(event: MouseEvent, row: Outcome) {
    event.preventDefault();

    if (this.isReadonlyIncomeRow(row)) {
      return;
    }

    this.rowActionRequested.emit({
      type: 'transaction',
      item: row,
      clientX: event.clientX,
      clientY: event.clientY
    });
  }

  onRowKeydown(event: KeyboardEvent, row: Outcome) {
    if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) {
      return;
    }

    event.preventDefault();

    if (this.isReadonlyIncomeRow(row)) {
      return;
    }

    const currentTarget = event.currentTarget as HTMLElement | null;
    const rowRect = currentTarget?.getBoundingClientRect();

    this.rowActionRequested.emit({
      type: 'transaction',
      item: row,
      clientX: rowRect ? rowRect.left + rowRect.width / 2 : window.innerWidth / 2,
      clientY: rowRect ? rowRect.top + rowRect.height / 2 : window.innerHeight / 2
    });
  }
}
