import {Component, OnInit, ViewChild, inject} from '@angular/core';
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

  loadData() {
    this.incomeService.getIncomes(this.currentPage, this.pageSize).subscribe(response => {
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
