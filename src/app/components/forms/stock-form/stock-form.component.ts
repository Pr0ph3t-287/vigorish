import { Component, EventEmitter, Output, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataTableService } from '../../../services/data-table.service';
import { CreateStockRequest } from '../../../models/stock.models';
import { Client } from '../../../models/client.models';

@Component({
  selector: 'app-stock-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './stock-form.component.html',
  styleUrl: './stock-form.component.css'
})
export class StockFormComponent implements OnInit {
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  formData = signal<CreateStockRequest>({
    name: '',
    description: '',
    quantity: 0,
    unitPrice: 0,
    category: '',
    clientId: 0
  });

  clients = signal<Client[]>([]);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  constructor(private dataService: DataTableService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.dataService.getAll<Client>('/api/clients').subscribe({
      next: (clients) => this.clients.set(clients),
      error: () => this.error.set('Failed to load clients')
    });
  }

  onSubmit(): void {
    if (!this.formData().name.trim()) {
      this.error.set('Name is required');
      return;
    }
    if (this.formData().clientId === 0) {
      this.error.set('Please select a client');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    this.dataService.create('/api/stocks', this.formData()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err.error?.message || 'Failed to create stock item');
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  updateField<K extends keyof CreateStockRequest>(field: K, value: any): void {
    this.formData.update(data => ({ ...data, [field]: value }));
  }
}
