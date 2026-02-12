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

  validatePhoneNumber(phone: string): boolean {
    if (!phone) return true; // Phone is optional

    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');

    // US phone number: 10 digits
    // International: 7-15 digits
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
  }

  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');

    // Format US phone numbers (10 digits)
    if (digitsOnly.length === 10) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
    }

    // For other lengths, just return the digits
    return digitsOnly;
  }

  validateEmail(email: string): boolean {
    if (!email) return false; // Email is required

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit(): void {
    if (!this.formData().name.trim()) {
      this.error.set('Name is required');
      return;
    }

    const email = this.formData().email;
    if (!email || !email.trim()) {
      this.error.set('Email is required');
      return;
    }

    if (!this.validateEmail(email)) {
      this.error.set('Please enter a valid email address');
      return;
    }

    const phone = this.formData().phone;
    if (phone && !this.validatePhoneNumber(phone)) {
      this.error.set('Please enter a valid phone number (7-15 digits)');
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

  onPhoneBlur(): void {
    const phone = this.formData().phone;
    if (phone) {
      const formatted = this.formatPhoneNumber(phone);
      this.updateField('phone', formatted);
    }
  }
}
