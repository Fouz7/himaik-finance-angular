import {Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, Renderer2, ElementRef} from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {provideNativeDateAdapter} from '@angular/material/core';

@Component({
  selector: 'app-input-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatButtonModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './input-dialog.html',
  styleUrl: './input-dialog.scss'
})
export class InputDialog implements OnChanges {
  @Input() data!: { type: 'income' | 'transaction' };
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<any>();

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    this.form = this.fb.group({});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.form = this.data.type === 'income'
        ? this.fb.group({
          name: ['', Validators.required],
          nominal: [null, [Validators.required, Validators.min(1)]],
          transfer_date: ['', Validators.required]
        })
        : this.fb.group({
          nominal: [null, [Validators.required, Validators.min(1)]],
          notes: ['', Validators.required]
        });
    }
  }

  submit(): void {
    if (this.form.valid) {
      this.submitted.emit(this.form.value);
    }
  }

  close(): void {
    this.renderer.addClass(this.el.nativeElement, 'closing');
    setTimeout(() => {
      this.closed.emit();
    }, 250);
  }
}
