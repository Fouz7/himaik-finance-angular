import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { StatusDialog } from './status-dialog';

describe('StatusDialog', () => {
  let component: StatusDialog;
  let fixture: ComponentFixture<StatusDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            variant: 'success',
            title: 'Income Added',
            message: 'The income was saved successfully.',
            actionLabel: 'Close'
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the supplied status content', () => {
    expect(fixture.nativeElement.querySelector('.status-dialog-title')?.textContent).toContain('Income Added');
    expect(fixture.nativeElement.querySelector('.status-dialog-message')?.textContent).toContain('The income was saved successfully.');
    expect(fixture.nativeElement.querySelector('.status-dialog-button')?.textContent).toContain('Close');
  });

  it('should use the success icon for success state', () => {
    expect(fixture.nativeElement.querySelector('.status-dialog-icon')?.textContent?.trim()).toBe('check_circle');
  });
});

