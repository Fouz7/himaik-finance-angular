import { Component, inject, OnDestroy } from '@angular/core';

import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BalanceService } from '../../services/balance-service';
import {
  NgxFileDropModule,
  NgxFileDropEntry,
  FileSystemFileEntry
} from 'ngx-file-drop';
import { MatIconModule } from '@angular/material/icon';
import { StatusDialog } from '../status-dialog/status-dialog';
import { extractApiErrorMessage } from '../../Utils/api-error';

@Component({
  selector: 'app-upload-evidence-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, NgxFileDropModule, MatIconModule],
  templateUrl: './upload-evidence-dialog.html',
  styleUrl: './upload-evidence-dialog.scss'
})
export class UploadEvidenceDialog implements OnDestroy {
  private ref = inject(MatDialogRef<UploadEvidenceDialog>);
  private dialog = inject(MatDialog);
  private balanceService = inject(BalanceService);

  file?: File;
  previewUrl?: string;
  uploading = false;

  dropped(files: NgxFileDropEntry[]): void {
    this.clearSelection();
    const first = files[0];
    if (!first || !first.fileEntry.isFile) return;

    (first.fileEntry as FileSystemFileEntry).file((file: File) => {
      if (!file.type.startsWith('image/')) return;
      this.file = file;
      this.previewUrl = URL.createObjectURL(file);
    });
  }

  remove(): void {
    this.clearSelection();
  }

  cancel(): void {
    this.ref.close();
  }

  upload(): void {
    if (!this.file || this.uploading) return;
    this.uploading = true;

    this.balanceService.uploadBalanceEvidence(this.file).subscribe({
      next: (res: { url: string }) => {
        this.uploading = false;
        this.dialog.open(StatusDialog, {
          panelClass: 'status-dialog-panel',
          data: {
            variant: 'success',
            title: 'Upload Successful',
            message: 'Balance evidence was uploaded successfully.'
          }
        }).afterClosed().subscribe(() => {
          this.ref.close({ imageUrl: res.url });
        });
      },
      error: (error: unknown) => {
        this.uploading = false;
        this.dialog.open(StatusDialog, {
          panelClass: 'status-dialog-panel',
          data: {
            variant: 'error',
            title: 'Upload Failed',
            message: extractApiErrorMessage(error, 'Unable to upload balance evidence. Please try again.')
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.revokePreview();
  }

  private clearSelection(): void {
    this.revokePreview();
    this.file = undefined;
  }

  private revokePreview(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = undefined;
    }
  }
}
