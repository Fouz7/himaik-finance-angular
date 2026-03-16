import { Component, effect, inject, signal, Signal, WritableSignal, OnInit, OnDestroy, viewChild, ElementRef, RendererFactory2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthServices } from '../../services/auth-services';
import { Income, IncomeService, UpdateIncomePayload } from '../../services/income-service';
import { Outcome, TransactionService, UpdateTransactionPayload } from '../../services/transaction-service';
import { Header } from '../../components/header/header';
import { forkJoin, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { BalanceService } from '../../services/balance-service';
import { MatIcon } from '@angular/material/icon';
import { IncomeTableComponent } from '../../components/income-table/income-table';
import { OutcomeTableComponent } from '../../components/outcome-table/outcome-table';
import { InputDialog, InputDialogData, InputDialogSubmitValue } from '../../components/input-dialog/input-dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MobileList } from '../../components/mobile-list/mobile-list';
import { Card } from '../../components/card/card';
import { Balance } from '../../components/balance/balance';
import { MatFabButton } from '@angular/material/button';
import { EvidenceDialog } from '../../components/evidence-dialog/evidence-dialog';
import { UploadEvidenceDialog } from '../../components/upload-evidence-dialog/upload-evidence-dialog';
import { ConfirmationDialog } from '../../components/confirmation-dialog/confirmation-dialog';
import { StatusDialog } from '../../components/status-dialog/status-dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { extractApiErrorMessage } from '../../Utils/api-error';

const COMPACT_DASHBOARD_QUERIES = [
  Breakpoints.XSmall,
  Breakpoints.Small,
  '(orientation: portrait) and (max-width: 1100px)',
  '(orientation: landscape) and (max-width: 960px) and (max-height: 700px)'
];

type DashboardRowActionRequest =
  | {
      type: 'income';
      item: Income;
      clientX: number;
      clientY: number;
    }
  | {
      type: 'transaction';
      item: Outcome;
      clientX: number;
      clientY: number;
    };

type DashboardRowActionState = DashboardRowActionRequest & {
  menuX: number;
  menuY: number;
};

type DashboardDialogState = InputDialogData & {
  itemId?: number;
};

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    Header,
    CommonModule,
    Card,
    MatIcon,
    IncomeTableComponent,
    OutcomeTableComponent,
    InputDialog,
    MatProgressSpinnerModule,
    MobileList,
    Balance,
    MatFabButton,
    MatTooltipModule
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage implements OnInit, OnDestroy {
  private authService = inject(AuthServices);
  private balanceService = inject(BalanceService);
  private dialog = inject(MatDialog);
  private incomeService = inject(IncomeService);
  private transactionService = inject(TransactionService);
  private breakpointObserver = inject(BreakpointObserver);
  private hostElement = inject<ElementRef<HTMLElement>>(ElementRef);
  private renderer = inject(RendererFactory2).createRenderer(null, null);
  private readonly incomeTable = viewChild(IncomeTableComponent);
  private readonly outcomeTable = viewChild(OutcomeTableComponent);

  showDialog = signal(false);
  dialogState = signal<DashboardDialogState>({ type: 'income', mode: 'create' });
  isLoading = signal(true);
  isActionMenuOpen = signal(false);
  isActionMenuVisible = signal(false);
  rowActionMenu = signal<DashboardRowActionState | null>(null);
  private actionMenuTimeoutId?: ReturnType<typeof setTimeout>;
  private removeDocumentPointerDownListener?: () => void;
  private removeDocumentKeydownListener?: () => void;
  private removeDocumentContextMenuListener?: () => void;

  isLoggedIn$: Observable<boolean> = this.authService.isLoggedIn$;
  balance: WritableSignal<any | undefined> = signal(undefined);
  totalIncome: WritableSignal<any | undefined> = signal(undefined);
  totalOutcome: WritableSignal<any | undefined> = signal(undefined);
  balanceEvidence: Signal<any | undefined> = toSignal(this.balanceService.showBalanceEvidence());

  mobileIncomes = signal<Income[]>([]);
  mobileOutcomes = signal<Outcome[]>([]);
  mobileIncomePage = signal<number>(1);
  mobileOutcomePage = signal<number>(1);
  mobileIncomeHasMore = signal<boolean>(true);
  mobileOutcomeHasMore = signal<boolean>(true);
  mobileLoadingIncome = signal<boolean>(false);
  mobileLoadingOutcome = signal<boolean>(false);
  isMobileListLoading = signal<boolean>(true);
  isTableLoading = signal<boolean>(true);
  incomeDataLength = signal<number>(0);
  outcomeDataLength = signal<number>(0);
  private readonly mobilePageSize = 10;

  useCompactDashboardLayout = toSignal(
    this.breakpointObserver.observe(COMPACT_DASHBOARD_QUERIES)
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

  isCompactHeader = toSignal(
    this.breakpointObserver.observe(COMPACT_DASHBOARD_QUERIES)
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

  constructor() {
    this.loadSummaryData(true);

    effect(() => {
      if (!this.isCompactHeader()) {
        this.closeActionMenu(true);
      }
    });
  }

  ngOnInit(): void {
    this.loadMobileIncomes();
    this.loadMobileOutcomes();
    this.refreshDesktopCounts();
  }

  ngOnDestroy(): void {
    this.detachRowActionMenuListeners();
  }

  onHeaderButtonClick() {
    this.closeRowActionMenu();

    if (this.isCompactHeader()) {
      this.toggleActionMenu();
      return;
    }

    this.onLogout();
  }

  onLogout() {
    this.closeActionMenu();
    this.closeRowActionMenu();
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: 'Logout Confirmation',
        message: 'Are you sure you want to logout?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authService.logout();
      }
    });
  }

  openDialog(config: 'income' | 'transaction' | DashboardDialogState) {
    const nextState = typeof config === 'string'
      ? { type: config, mode: 'create' as const }
      : config;

    this.closeRowActionMenu();
    this.dialogState.set(nextState);
    this.showDialog.set(true);
  }

  openIncomeFromMenu() {
    this.closeActionMenu();
    this.openDialog('income');
  }

  openTransactionFromMenu() {
    this.closeActionMenu();
    this.openDialog('transaction');
  }

  openUploadEvidenceFromMenu(): void {
    this.closeActionMenu();
    this.openUploadEvidenceDialog();
  }

  onDialogClose() {
    this.showDialog.set(false);
  }

  onDialogSubmit(result: InputDialogSubmitValue) {
    const currentDialogState = this.dialogState();
    this.showDialog.set(false);

    if (currentDialogState.mode === 'edit' && currentDialogState.itemId) {
      this.submitEdit(currentDialogState, result);
      return;
    }

    const isIncome = currentDialogState.type === 'income';
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        title: isIncome ? 'Income Confirmation' : 'Transaction Confirmation',
        message: `Are you sure you want to add this ${isIncome ? 'income' : 'transaction'}?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      if (isIncome) {
        this.incomeService.addIncome({
          name: result.name ?? '',
          nominal: result.nominal,
          transfer_date: result.transfer_date ?? ''
        }).subscribe({
          next: () => {
            this.refreshDashboardData();
            this.openStatusDialog({
              variant: 'success',
              title: 'Income Added',
              message: 'The income was added successfully.'
            });
          },
          error: (error: unknown) => {
            this.openStatusDialog({
              variant: 'error',
              title: 'Failed to Add Income',
              message: extractApiErrorMessage(error, 'Unable to add income. Please try again.')
            });
          }
        });
      } else {
        this.transactionService.addTransaction({
          nominal: result.nominal,
          notes: result.notes ?? ''
        }).subscribe({
          next: () => {
            this.refreshDashboardData();
            this.openStatusDialog({
              variant: 'success',
              title: 'Transaction Added',
              message: 'The transaction was added successfully.'
            });
          },
          error: (error: unknown) => {
            this.openStatusDialog({
              variant: 'error',
              title: 'Failed to Add Transaction',
              message: extractApiErrorMessage(error, 'Unable to add transaction. Please try again.')
            });
          }
        });
      }
    });
  }

  openBalanceEvidenceDialog(): void {
    const url = this.balanceEvidence()?.url;
    if (!url) return;
    this.dialog.open(EvidenceDialog, {
      data: { imageUrl: url }
    });
  }

  updateEvidence(): void {
    const ref = this.dialog.open(UploadEvidenceDialog, {
      width: '520px',
      disableClose: true
    });
    ref.afterClosed().subscribe(() => {
    });
  }

  openUploadEvidenceDialog(): void {
    this.updateEvidence();
  }

  loadMobileIncomes() {
    if (this.mobileLoadingIncome()) return;
    this.mobileLoadingIncome.set(true);

    this.incomeService.getIncomes(this.mobileIncomePage(), this.mobilePageSize).subscribe(response => {
      if (this.mobileIncomePage() === 1) {
        this.mobileIncomes.set(response.data);
      } else {
        this.mobileIncomes.update(data => [...data, ...response.data]);
      }
      this.mobileIncomeHasMore.set((this.mobileIncomePage() * this.mobilePageSize) < response.pagination.totalItems);
      this.mobileLoadingIncome.set(false);
      this.checkMobileListLoadingComplete();
    });
  }

  loadMobileOutcomes() {
    if (this.mobileLoadingOutcome()) return;
    this.mobileLoadingOutcome.set(true);

    this.transactionService.getOutcomes(this.mobileOutcomePage(), this.mobilePageSize).subscribe(response => {
      if (this.mobileOutcomePage() === 1) {
        this.mobileOutcomes.set(response.data);
      } else {
        this.mobileOutcomes.update(data => [...data, ...response.data]);
      }
      this.mobileOutcomeHasMore.set((this.mobileOutcomePage() * this.mobilePageSize) < response.pagination.totalItems);
      this.mobileLoadingOutcome.set(false);
      this.checkMobileListLoadingComplete();
    });
  }

  onMobileLoadMore(type: 'income' | 'outcome') {
    if (type === 'income') {
      if (this.mobileIncomeHasMore() && !this.mobileLoadingIncome()) {
        this.mobileIncomePage.update(page => page + 1);
        this.loadMobileIncomes();
      }
    } else {
      if (this.mobileOutcomeHasMore() && !this.mobileLoadingOutcome()) {
        this.mobileOutcomePage.update(page => page + 1);
        this.loadMobileOutcomes();
      }
    }
  }

  openRowActionMenu(request: DashboardRowActionRequest) {
    if (request.type === 'transaction' && this.isReadonlyIncomeTransaction(request.item)) {
      this.closeRowActionMenu();
      return;
    }

    this.closeActionMenu();

    const menuWidth = 208;
    const menuHeight = 132;
    const viewportPadding = 12;
    const menuX = Math.min(
      Math.max(viewportPadding, request.clientX),
      window.innerWidth - menuWidth - viewportPadding
    );
    const menuY = Math.min(
      Math.max(viewportPadding, request.clientY),
      window.innerHeight - menuHeight - viewportPadding
    );

    this.rowActionMenu.set({
      ...request,
      menuX,
      menuY
    });
    this.attachRowActionMenuListeners();
  }

  closeRowActionMenu() {
    this.rowActionMenu.set(null);
    this.detachRowActionMenuListeners();
  }

  editSelectedRow() {
    const rowAction = this.rowActionMenu();
    if (!rowAction) {
      return;
    }

    this.closeRowActionMenu();

    if (rowAction.type === 'income') {
      this.openDialog({
        type: 'income',
        mode: 'edit',
        itemId: rowAction.item.id,
        initialValue: {
          name: rowAction.item.name,
          nominal: Number(rowAction.item.nominal),
          transfer_date: rowAction.item.transfer_date
        }
      });
      return;
    }

    this.openDialog({
      type: 'transaction',
      mode: 'edit',
      itemId: rowAction.item.transactionId,
      initialValue: {
        nominal: this.getTransactionNominal(rowAction.item),
        notes: rowAction.item.notes
      }
    });
  }

  deleteSelectedRow() {
    const rowAction = this.rowActionMenu();
    if (!rowAction) {
      return;
    }

    this.closeRowActionMenu();
    const isIncome = rowAction.type === 'income';

    this.dialog.open(ConfirmationDialog, {
      data: {
        title: isIncome ? 'Delete Income' : 'Delete Transaction',
        message: `Are you sure you want to delete this ${isIncome ? 'income' : 'transaction'}?`
      }
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      const request = isIncome
        ? this.incomeService.deleteIncome(rowAction.item.id)
        : this.transactionService.deleteTransaction(rowAction.item.transactionId);

      request.subscribe({
        next: () => {
          this.refreshDashboardData();
          this.openStatusDialog({
            variant: 'success',
            title: isIncome ? 'Income Deleted' : 'Transaction Deleted',
            message: `The ${isIncome ? 'income' : 'transaction'} was deleted successfully.`
          });
        },
        error: (error: unknown) => {
          this.openStatusDialog({
            variant: 'error',
            title: isIncome ? 'Failed to Delete Income' : 'Failed to Delete Transaction',
            message: extractApiErrorMessage(error, `Unable to delete the ${isIncome ? 'income' : 'transaction'}. Please try again.`)
          });
        }
      });
    });
  }

  private toggleActionMenu(): void {
    if (this.isActionMenuOpen()) {
      this.closeActionMenu();
      return;
    }

    this.openActionMenu();
  }

  private openActionMenu(): void {
    this.closeRowActionMenu();
    this.clearActionMenuTimeout();
    this.isActionMenuVisible.set(true);
    this.isActionMenuOpen.set(true);
  }

  private closeActionMenu(immediate = false): void {
    this.clearActionMenuTimeout();
    this.isActionMenuOpen.set(false);

    if (immediate) {
      this.isActionMenuVisible.set(false);
      return;
    }

    this.actionMenuTimeoutId = setTimeout(() => {
      this.isActionMenuVisible.set(false);
      this.actionMenuTimeoutId = undefined;
    }, 360);
  }

  private clearActionMenuTimeout(): void {
    if (this.actionMenuTimeoutId) {
      clearTimeout(this.actionMenuTimeoutId);
      this.actionMenuTimeoutId = undefined;
    }
  }

  private attachRowActionMenuListeners() {
    this.detachRowActionMenuListeners();

    this.removeDocumentPointerDownListener = this.renderer.listen('document', 'pointerdown', (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        this.closeRowActionMenu();
        return;
      }

      const clickedInsideMenu = target instanceof Element && !!target.closest('.row-action-menu');

      if (clickedInsideMenu) {
        return;
      }

      this.closeRowActionMenu();
    });

    this.removeDocumentContextMenuListener = this.renderer.listen('document', 'contextmenu', (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        this.closeRowActionMenu();
        event.preventDefault();
        return;
      }

      if (target.closest('.row-action-menu')) {
        event.preventDefault();
        return;
      }

      if (target.closest('.interactive-row') || target.closest('.list-item')) {
        return;
      }

      this.closeRowActionMenu();
      event.preventDefault();
    });

    this.removeDocumentKeydownListener = this.renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.closeRowActionMenu();
      }
    });
  }

  private detachRowActionMenuListeners() {
    this.removeDocumentPointerDownListener?.();
    this.removeDocumentPointerDownListener = undefined;
    this.removeDocumentContextMenuListener?.();
    this.removeDocumentContextMenuListener = undefined;
    this.removeDocumentKeydownListener?.();
    this.removeDocumentKeydownListener = undefined;
  }

  private openStatusDialog(data: {
    variant: 'success' | 'error';
    title: string;
    message: string;
  }) {
    return this.dialog.open(StatusDialog, {
      data,
      panelClass: 'status-dialog-panel'
    });
  }

  private submitEdit(dialogState: DashboardDialogState, result: InputDialogSubmitValue) {
    if (dialogState.type === 'income' && dialogState.itemId) {
      const payload = this.buildIncomeUpdatePayload(dialogState, result);

      if (Object.keys(payload).length === 0) {
        this.openStatusDialog({
          variant: 'error',
          title: 'No Changes Detected',
          message: 'Update at least one income field before saving.'
        });
        return;
      }

      this.incomeService.updateIncome(dialogState.itemId, payload).subscribe({
        next: () => {
          this.refreshDashboardData();
          this.openStatusDialog({
            variant: 'success',
            title: 'Income Updated',
            message: 'The income was updated successfully.'
          });
        },
        error: (error: unknown) => {
          this.openStatusDialog({
            variant: 'error',
            title: 'Failed to Update Income',
            message: extractApiErrorMessage(error, 'Unable to update income. Please try again.')
          });
        }
      });

      return;
    }

    if (dialogState.type === 'transaction' && dialogState.itemId) {
      const payload = this.buildTransactionUpdatePayload(dialogState, result);

      if (Object.keys(payload).length === 0) {
        this.openStatusDialog({
          variant: 'error',
          title: 'No Changes Detected',
          message: 'Update at least one transaction field before saving.'
        });
        return;
      }

      this.transactionService.updateTransaction(dialogState.itemId, payload).subscribe({
        next: () => {
          this.refreshDashboardData();
          this.openStatusDialog({
            variant: 'success',
            title: 'Transaction Updated',
            message: 'The transaction was updated successfully.'
          });
        },
        error: (error: unknown) => {
          this.openStatusDialog({
            variant: 'error',
            title: 'Failed to Update Transaction',
            message: extractApiErrorMessage(error, 'Unable to update transaction. Please try again.')
          });
        }
      });
    }
  }

  private buildIncomeUpdatePayload(dialogState: DashboardDialogState, result: InputDialogSubmitValue): UpdateIncomePayload {
    const initialValue = dialogState.initialValue;
    const payload: UpdateIncomePayload = {};
    const nextName = result.name?.trim() ?? '';
    const initialName = initialValue?.name?.trim() ?? '';
    const initialNominal = Number(initialValue?.nominal ?? 0);
    const nextTransferDate = this.normalizeComparableDate(result.transfer_date);
    const initialTransferDate = this.normalizeComparableDate(initialValue?.transfer_date);

    if (nextName && nextName !== initialName) {
      payload.name = nextName;
    }

    if (result.nominal !== initialNominal) {
      payload.nominal = result.nominal;
    }

    if (nextTransferDate && nextTransferDate !== initialTransferDate) {
      payload.transfer_date = nextTransferDate;
    }

    return payload;
  }

  private buildTransactionUpdatePayload(dialogState: DashboardDialogState, result: InputDialogSubmitValue): UpdateTransactionPayload {
    const initialValue = dialogState.initialValue;
    const payload: UpdateTransactionPayload = {};
    const nextNotes = result.notes?.trim() ?? '';
    const initialNotes = initialValue?.notes?.trim() ?? '';
    const initialNominal = Number(initialValue?.nominal ?? 0);

    if (result.nominal !== initialNominal) {
      payload.nominal = result.nominal;
    }

    if (nextNotes && nextNotes !== initialNotes) {
      payload.notes = nextNotes;
    }

    return payload;
  }

  private refreshDashboardData() {
    this.loadSummaryData();
    this.refreshDesktopCounts();
    this.resetMobileLists();
  }

  private loadSummaryData(showLoading = false) {
    if (showLoading) {
      this.isLoading.set(true);
    }

    forkJoin({
      balance: this.balanceService.getBalance(),
      totalIncome: this.balanceService.getTotalIncome(),
      totalOutcome: this.balanceService.getTotalOutcome()
    }).subscribe({
      next: (data) => {
        this.balance.set(data.balance);
        this.totalIncome.set(data.totalIncome);
        this.totalOutcome.set(data.totalOutcome);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private refreshDesktopCounts() {
    this.isTableLoading.set(true);

    forkJoin({
      incomes: this.incomeService.getIncomes(1, 10),
      outcomes: this.transactionService.getOutcomes(1, 10)
    }).subscribe({
      next: ({ incomes, outcomes }) => {
        this.incomeDataLength.set(incomes.pagination.totalItems);
        this.outcomeDataLength.set(outcomes.pagination.totalItems);
        this.isTableLoading.set(false);
        this.incomeTable()?.refreshCurrentPage();
        this.outcomeTable()?.refreshCurrentPage();
      },
      error: () => {
        this.isTableLoading.set(false);
        this.incomeTable()?.refreshCurrentPage();
        this.outcomeTable()?.refreshCurrentPage();
      }
    });
  }

  private resetMobileLists() {
    this.isMobileListLoading.set(true);
    this.mobileIncomePage.set(1);
    this.mobileOutcomePage.set(1);
    this.mobileIncomeHasMore.set(true);
    this.mobileOutcomeHasMore.set(true);
    this.loadMobileIncomes();
    this.loadMobileOutcomes();
  }

  private getTransactionNominal(item: Outcome): number {
    return Number(item.debit) || Number(item.credit) || 0;
  }

  private isReadonlyIncomeTransaction(item: Outcome): boolean {
    return Number(item.credit) > 0 && Number(item.debit) === 0;
  }

  private normalizeComparableDate(value?: string | Date | null): string {
    if (!value) {
      return '';
    }

    if (value instanceof Date) {
      return this.formatDate(value);
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return this.formatDate(parsedDate);
  }

  private formatDate(value: Date): string {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


  private checkMobileListLoadingComplete() {
    if (!this.mobileLoadingIncome() && !this.mobileLoadingOutcome()) {
      this.isMobileListLoading.set(false);
    }
  }
}
