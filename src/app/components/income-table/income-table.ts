import { Component, OnInit, ViewChild, inject, output } from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {CommonModule} from '@angular/common';
import {Income, IncomeService} from '../../services/income-service';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-income-table',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, CommonModule, MatIcon],
  templateUrl: './income-table.html',
  styleUrl: './income-table.scss'
})
export class IncomeTableComponent implements OnInit {
  private incomeService = inject(IncomeService);
  readonly rowActionRequested = output<{
    type: 'income';
    item: Income;
    clientX: number;
    clientY: number;
  }>();

  displayedColumns: string[] = ['name', 'nominal', 'transfer_date', 'createdBy'];
  dataSource = new MatTableDataSource<Income>();
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
    this.incomeService.getIncomes(this.currentPage, this.pageSize).subscribe(response => {
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

  onRowContextMenu(event: MouseEvent, row: Income) {
    event.preventDefault();
    this.rowActionRequested.emit({
      type: 'income',
      item: row,
      clientX: event.clientX,
      clientY: event.clientY
    });
  }

  onRowKeydown(event: KeyboardEvent, row: Income) {
    if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) {
      return;
    }

    event.preventDefault();
    const currentTarget = event.currentTarget as HTMLElement | null;
    const rowRect = currentTarget?.getBoundingClientRect();

    this.rowActionRequested.emit({
      type: 'income',
      item: row,
      clientX: rowRect ? rowRect.left + rowRect.width / 2 : window.innerWidth / 2,
      clientY: rowRect ? rowRect.top + rowRect.height / 2 : window.innerHeight / 2
    });
  }
}
