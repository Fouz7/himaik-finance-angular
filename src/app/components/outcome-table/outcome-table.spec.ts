import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutcomeTable } from './outcome-table';

describe('OutcomeTable', () => {
  let component: OutcomeTable;
  let fixture: ComponentFixture<OutcomeTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutcomeTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutcomeTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
