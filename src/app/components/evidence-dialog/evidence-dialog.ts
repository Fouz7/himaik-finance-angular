import { Component, Inject, inject, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UploadEvidenceDialog } from '../upload-evidence-dialog/upload-evidence-dialog';
import { BalanceService } from '../../services/balance-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-evidence-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './evidence-dialog.html',
  styleUrl: './evidence-dialog.scss'
})
export class EvidenceDialog implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private balanceService = inject(BalanceService);
  private sub?: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string },
    private ref: MatDialogRef<EvidenceDialog>
  ) {}

  ngOnInit(): void {
    this.sub = this.balanceService.showBalanceEvidence().subscribe(res => {
      this.data.imageUrl = this.withCacheBust(res.url);
      this.cdr.detectChanges();
      this.ref.updateSize();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  close(): void {
    this.ref.close();
  }

  updateEvidence(): void {
    const dRef: MatDialogRef<UploadEvidenceDialog, { imageUrl?: string }> =
      this.dialog.open(UploadEvidenceDialog, {
        width: '520px',
        disableClose: true
      });

    dRef.afterClosed().subscribe(result => {
      if (result?.imageUrl) {
        this.data.imageUrl = this.withCacheBust(result.imageUrl);
        this.cdr.detectChanges();
        this.ref.updateSize();
      }
    });
  }

  private withCacheBust(url: string): string {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}t=${Date.now()}`;
  }
}
