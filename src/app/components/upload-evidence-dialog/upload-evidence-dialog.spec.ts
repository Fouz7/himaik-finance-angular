import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadEvidenceDialog } from './upload-evidence-dialog';

describe('UploadEvidenceDialog', () => {
  let component: UploadEvidenceDialog;
  let fixture: ComponentFixture<UploadEvidenceDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadEvidenceDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadEvidenceDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
