import {Component, OnInit, ViewChild, inject} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {CommonModule} from '@angular/common';
import {Outcome, TransactionService} from '../../services/transaction-service';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-outcome-table',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, CommonModule, MatIcon],
  templateUrl: './outcome-table.html',
  styleUrl: './outcome-table.scss'
})
export class OutcomeTableComponent implements OnInit {
  private transactionService = inject(TransactionService);

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

  loadData() {
    this.transactionService.getOutcomes(this.currentPage, this.pageSize).subscribe(response => {
      this.total = response.pagination.totalItems;
      this.dataSource.data = response.data;
      this.totalPages = Math.ceil(this.total / this.pageSize);
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
}
