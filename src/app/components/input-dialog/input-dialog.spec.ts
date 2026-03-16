import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';

import { InputDialog } from './input-dialog';

describe('InputDialog', () => {
  let component: InputDialog;
  let fixture: ComponentFixture<InputDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputDialog);
    component = fixture.componentInstance;
    component.data = { type: 'income' };
    component.ngOnChanges({
      data: new SimpleChange(undefined, component.data, true)
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the income dialog without helper subtitle', () => {
    const actionButtons = fixture.nativeElement.querySelectorAll('.dialog-card-button') as NodeListOf<HTMLButtonElement>;
    const buttons = Array.from(actionButtons).map(button => button.textContent?.trim());

    expect(fixture.nativeElement.querySelector('.dialog-card-title')?.textContent).toContain('Add Income');
    expect(fixture.nativeElement.querySelector('.dialog-card-subtitle')).toBeNull();
    expect(buttons).toEqual(['Save Income', 'Cancel']);
  });

  it('should render add transaction for transaction type', () => {
    component.data = { type: 'transaction' };
    component.ngOnChanges({
      data: new SimpleChange({ type: 'income' }, component.data, false)
    });
    fixture.detectChanges();

    const actionButtons = fixture.nativeElement.querySelectorAll('.dialog-card-button') as NodeListOf<HTMLButtonElement>;
    const buttons = Array.from(actionButtons).map(button => button.textContent?.trim());

    expect(fixture.nativeElement.querySelector('.dialog-card-title')?.textContent).toContain('Add Transaction');
    expect(buttons).toEqual(['Save Transaction', 'Cancel']);
  });
});
