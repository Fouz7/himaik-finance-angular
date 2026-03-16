import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { BalanceService } from '../../services/balance-service';
import { UploadEvidenceDialog } from './upload-evidence-dialog';

describe('UploadEvidenceDialog', () => {
  let component: UploadEvidenceDialog;
  let fixture: ComponentFixture<UploadEvidenceDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadEvidenceDialog],
      providers: [
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['close'])
        },
        {
          provide: MatDialog,
          useValue: {
            open: () => ({
              afterClosed: () => of(true)
            })
          }
        },
        {
          provide: BalanceService,
          useValue: jasmine.createSpyObj('BalanceService', ['uploadBalanceEvidence'])
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadEvidenceDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render upload action above cancel', () => {
    const actionButtons = fixture.nativeElement.querySelectorAll('.dialog-card-button') as NodeListOf<HTMLButtonElement>;
    const buttons = Array.from(actionButtons).map(button => button.textContent?.trim());

    expect(fixture.nativeElement.querySelector('.dialog-card-title')?.textContent).toContain('Upload Evidence');
    expect(buttons).toEqual(['Upload Evidence', 'Cancel']);
  });

  it('should disable upload button when no file is selected', () => {
    const uploadButton = fixture.nativeElement.querySelector('.dialog-card-button-primary') as HTMLButtonElement;

    expect(uploadButton.disabled).toBeTrue();
  });
});
