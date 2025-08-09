import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeTable } from './income-table';

describe('IncomeTable', () => {
  let component: IncomeTable;
  let fixture: ComponentFixture<IncomeTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
