import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableContainer } from './table-container';

describe('TableContainer', () => {
  let component: TableContainer;
  let fixture: ComponentFixture<TableContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
