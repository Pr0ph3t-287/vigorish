import { Component, ViewChild, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { StockFormComponent } from '../../components/forms/stock-form/stock-form.component';
import { DataTableService } from '../../services/data-table.service';
import { AuthService } from '../../services/auth.service';
import { TableConfig } from '../../models/data-table.models';
import { Stock } from '../../models/stock.models';
import { Client } from '../../models/client.models';

@Component({
  selector: 'app-stocks-list',
  standalone: true,
  imports: [DataTableComponent, StockFormComponent],
  templateUrl: './stocks-list.component.html',
  styleUrl: './stocks-list.component.css'
})
export class StocksListComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent<Stock>;
  showModal = signal(false);
  editingStock = signal<Stock | undefined>(undefined);
  clients = signal<Client[]>([]);
  tableConfig: TableConfig<Stock> = {
    columns: [
      { key: 'id', label: 'ID', sortable: true, width: '80px' },
      { key: 'name', label: 'Item Name', sortable: true },
      {
        key: 'clientId',
        label: 'Client',
        sortable: true,
        formatter: (value, row) => {
          const client = this.clients().find(c => c.id === row.clientId);
          return client?.name || `Client #${value}`;
        }
      },
      { key: 'category', label: 'Category', sortable: true },
      { key: 'description', label: 'Description', sortable: false },
      {
        key: 'quantity',
        label: 'Quantity',
        sortable: true,
        searchable: false,
        formatter: (value) => value?.toString() || '0'
      },
      {
        key: 'unitPrice',
        label: 'Unit Price',
        sortable: true,
        searchable: false,
        formatter: (value) => value ? `$${value.toFixed(2)}` : '$0.00'
      },
      {
        key: 'totalValue',
        label: 'Total Value',
        sortable: false,
        searchable: false,
        formatter: (_, row) => `$${(row.quantity * row.unitPrice).toFixed(2)}`
      }
    ],
    apiEndpoint: '/api/stocks',
    itemsPerPage: 10,
    searchPlaceholder: 'Search stocks...',
    showCreate: true,
    createButtonText: 'Add Stock',
    rowClickable: false,
    showActions: true,
    showEdit: true,
    showDelete: false
  };

  constructor(
    private router: Router,
    private dataService: DataTableService,
    private authService: AuthService
  ) {
    // Show delete button only for Admin users
    this.tableConfig.showDelete = this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.dataService.getAll<Client>('/api/clients').subscribe({
      next: (clients) => this.clients.set(clients),
      error: (err) => console.error('Failed to load clients:', err)
    });
  }

  onRowClick(stock: Stock): void {
    this.router.navigate(['/stocks', stock.id]);
  }

  onCreateClick(): void {
    this.editingStock.set(undefined);
    this.showModal.set(true);
  }

  onEditClick(stock: Stock): void {
    this.editingStock.set(stock);
    this.showModal.set(true);
  }

  onDeleteClick(stock: Stock): void {
    if (confirm(`Are you sure you want to delete stock item "${stock.name}"?`)) {
      this.dataService.delete('/api/stocks', stock.id).subscribe({
        next: () => {
          this.dataTable.loadData();
        },
        error: (err) => {
          alert(`Failed to delete stock item: ${err.error?.message || 'Unknown error'}`);
        }
      });
    }
  }

  onFormSaved(): void {
    this.showModal.set(false);
    this.editingStock.set(undefined);
    this.dataTable.loadData();
  }

  onFormCancelled(): void {
    this.showModal.set(false);
    this.editingStock.set(undefined);
  }
}
