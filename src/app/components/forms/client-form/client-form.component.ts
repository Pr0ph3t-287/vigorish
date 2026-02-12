import { Component, EventEmitter, Output, Input, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataTableService } from '../../../services/data-table.service';
import { CreateClientRequest, Client } from '../../../models/client.models';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css',
})
export class ClientFormComponent implements OnInit {
  @Input() client?: Client;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  formData = signal<CreateClientRequest>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  isSubmitting = signal(false);
  error = signal<string | null>(null);

  constructor(private dataService: DataTableService) {}

  ngOnInit(): void {
    if (this.client) {
      this.formData.set({
        name: this.client.name,
        email: this.client.email || '',
        phone: this.client.phone || '',
        address: this.client.address || '',
      });
    }
  }

  get isEditMode(): boolean {
    return !!this.client;
  }

  onSubmit(): void {
    if (!this.formData().name.trim()) {
      this.error.set('Name is required');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const request = this.isEditMode
      ? this.dataService.update('/api/clients', this.client!.id, this.formData())
      : this.dataService.create('/api/clients', this.formData());

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(
          err.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} client`,
        );
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  updateField<K extends keyof CreateClientRequest>(field: K, value: string): void {
    this.formData.update((data) => ({ ...data, [field]: value }));
  }
}
