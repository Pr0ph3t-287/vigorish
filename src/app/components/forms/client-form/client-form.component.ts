import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataTableService } from '../../../services/data-table.service';
import { CreateClientRequest } from '../../../models/client.models';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css'
})
export class ClientFormComponent {
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  formData = signal<CreateClientRequest>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  isSubmitting = signal(false);
  error = signal<string | null>(null);

  constructor(private dataService: DataTableService) {}

  onSubmit(): void {
    if (!this.formData().name.trim()) {
      this.error.set('Name is required');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    this.dataService.create('/api/clients', this.formData()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err.error?.message || 'Failed to create client');
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  updateField<K extends keyof CreateClientRequest>(field: K, value: string): void {
    this.formData.update(data => ({ ...data, [field]: value }));
  }
}
