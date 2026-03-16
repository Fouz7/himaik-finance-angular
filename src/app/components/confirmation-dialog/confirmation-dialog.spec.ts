import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ConfirmationDialog } from './confirmation-dialog';

describe('ConfirmationDialog', () => {
  let component: ConfirmationDialog;
  let fixture: ComponentFixture<ConfirmationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            title: 'Logout Confirmation',
            message: 'Are you sure you want to logout?'
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the confirmation message without helper subtitle', () => {
    const actionButtons = fixture.nativeElement.querySelectorAll('.dialog-card-button') as NodeListOf<HTMLButtonElement>;
    const buttons = Array.from(actionButtons).map(button => button.textContent?.trim());

    expect(fixture.nativeElement.querySelector('.dialog-card-title')?.textContent).toContain('Logout Confirmation');
    expect(fixture.nativeElement.querySelector('.dialog-card-message')?.textContent).toContain('Are you sure you want to logout?');
    expect(fixture.nativeElement.querySelector('.dialog-card-subtitle')).toBeNull();
    expect(buttons).toEqual(['Confirm', 'Cancel']);
  });
});
