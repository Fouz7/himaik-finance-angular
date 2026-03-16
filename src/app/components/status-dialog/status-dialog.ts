import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface StatusDialogData {
  variant: 'success' | 'error';
  title: string;
  message: string;
  actionLabel?: string;
}

@Component({
  selector: 'app-status-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule],
  templateUrl: './status-dialog.html',
  styleUrl: './status-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusDialog {
  readonly data = inject<StatusDialogData>(MAT_DIALOG_DATA);
}
