import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Balance } from './balance';

describe('Balance', () => {
  let component: Balance;
  let fixture: ComponentFixture<Balance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Balance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Balance);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Total Income');
    fixture.componentRef.setInput('nominal', 'Rp 1,250,000');
    fixture.componentRef.setInput('type', 'card-income');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep the currency prefix to the left of the numeric value', () => {
    const nominal = fixture.nativeElement.querySelector('.nominal') as HTMLElement;

    expect(fixture.nativeElement.querySelector('.currency-prefix')?.textContent?.trim()).toBe('Rp');
    expect(fixture.nativeElement.querySelector('.numeric-value')?.textContent?.trim()).toBe('1,250,000');
    expect(nominal.textContent?.replace(/\s+/g, ' ').trim()).toBe('Rp 1,250,000');
  });

  it('should render the title below the nominal content', () => {
    expect(fixture.nativeElement.querySelector('.pText')?.textContent?.trim()).toBe('Total Income');
    expect(fixture.nativeElement.querySelector('.nCard.card-income')).toBeTruthy();
  });
});
