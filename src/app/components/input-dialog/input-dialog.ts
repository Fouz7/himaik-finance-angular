import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, Renderer2, ElementRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';

export type InputDialogMode = 'create' | 'edit';

export interface InputDialogData {
  type: 'income' | 'transaction';
  mode?: InputDialogMode;
  initialValue?: {
    name?: string;
    nominal?: number | null;
    transfer_date?: string | Date | null;
    notes?: string;
  };
}

export interface InputDialogSubmitValue {
  name?: string;
  nominal: number;
  transfer_date?: string;
  notes?: string;
}

type InputDialogForm = {
  name: FormControl<string | null>;
  nominal: FormControl<number | null>;
  transfer_date: FormControl<string | Date | null>;
  notes: FormControl<string | null>;
};

@Component({
  selector: 'app-input-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './input-dialog.html',
  styleUrl: './input-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputDialog implements OnChanges {
  @Input() data!: InputDialogData;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<InputDialogSubmitValue>();

  form: FormGroup<InputDialogForm>;

  constructor(
    private fb: FormBuilder,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    this.form = this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      const initialValue = this.data.initialValue;
      this.form.reset({
        name: initialValue?.name ?? '',
        nominal: initialValue?.nominal ?? null,
        transfer_date: this.resolveDateControlValue(initialValue?.transfer_date),
        notes: initialValue?.notes ?? ''
      });

      this.configureControl(this.form.controls.name, this.data.type === 'income' ? [Validators.required] : []);
      this.configureControl(this.form.controls.nominal, [Validators.required, Validators.min(1)]);
      this.configureControl(this.form.controls.transfer_date, this.data.type === 'income' ? [Validators.required] : []);
      this.configureControl(this.form.controls.notes, this.data.type === 'transaction' ? [Validators.required] : []);
    }
  }

  submit(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();

      this.submitted.emit({
        name: formValue.name?.trim() || undefined,
        nominal: Number(formValue.nominal),
        transfer_date: this.normalizeDateValue(formValue.transfer_date),
        notes: formValue.notes?.trim() || undefined
      });
    }
  }

  close(): void {
    this.renderer.addClass(this.el.nativeElement, 'closing');
    setTimeout(() => {
      this.closed.emit();
    }, 250);
  }

  private createForm(): FormGroup<InputDialogForm> {
    return this.fb.group({
      name: this.fb.control<string | null>(''),
      nominal: this.fb.control<number | null>(null),
      transfer_date: this.fb.control<string | Date | null>(''),
      notes: this.fb.control<string | null>('')
    });
  }

  private configureControl(control: AbstractControl, validators: ValidatorFn[]): void {
    control.setValidators(validators);
    control.updateValueAndValidity({ emitEvent: false });
  }

  private resolveDateControlValue(value?: string | Date | null): string | Date | null {
    if (!value) {
      return '';
    }

    if (value instanceof Date) {
      return value;
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? value : parsedDate;
  }

  private normalizeDateValue(value: string | Date | null): string | undefined {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return this.formatDate(value);
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? value : this.formatDate(parsedDate);
  }

  private formatDate(value: Date): string {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
