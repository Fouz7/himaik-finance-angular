import {AfterViewInit, Component, QueryList, ViewChildren, inject, OnInit} from '@angular/core';
import {MatTab, MatTabChangeEvent, MatTabGroup} from '@angular/material/tabs';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {CommonModule} from '@angular/common';
import {Income, IncomeService} from '../../services/income-service';
import {Outcome, TransactionService} from '../../services/transaction-service';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {tap} from 'rxjs';

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
export class TableContainer implements OnInit, AfterViewInit {
  private incomeService = inject(IncomeService);
  private transactionService = inject(TransactionService);

  incomeDisplayedColumns: string[] = ['name', 'nominal', 'transfer_date', 'createdBy'];
  incomeDataSource = new MatTableDataSource<Income>();
  totalIncomes = 0;

  outcomeDisplayedColumns: string[] = ['notes', 'debit', 'credit', 'createdBy', 'createdAt'];
  outcomeDataSource = new MatTableDataSource<Outcome>();
  totalOutcomes = 0;

  @ViewChildren(MatPaginator) paginators = new QueryList<MatPaginator>();

  ngOnInit() {
    this.loadIncomes();
    this.loadOutcomes();
  }

  ngAfterViewInit() {
    this.paginators.first.page
      .pipe(tap(() => this.loadIncomes()))
      .subscribe();
    this.loadIncomes();

    this.paginators.last.page
      .pipe(tap(() => this.loadOutcomes()))
      .subscribe();
  }

  loadIncomes() {
    const paginator = this.paginators.first;
    const page = paginator ? paginator.pageIndex + 1 : 1;
    const limit = paginator ? paginator.pageSize : 5;
    this.incomeService.getIncomes(page, limit).subscribe(response => {
      this.totalIncomes = response.pagination.totalItems;
      this.incomeDataSource.data = response.data;
    });
  }

  loadOutcomes() {
    const paginator = this.paginators.last;
    const page = paginator ? paginator.pageIndex + 1 : 1;
    const limit = paginator ? paginator.pageSize : 5;
    this.transactionService.getOutcomes(page, limit).subscribe(response => {
      this.totalOutcomes = response.pagination.totalItems;
      this.outcomeDataSource.data = response.data;
    });
  }
}
