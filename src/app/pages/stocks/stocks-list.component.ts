import { Component, ViewChild, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { StockFormComponent } from '../../components/forms/stock-form/stock-form.component';
import { TableConfig } from '../../models/data-table.models';
import { Stock } from '../../models/stock.models';

@Component({
  selector: 'app-stocks-list',
  standalone: true,
  imports: [DataTableComponent, StockFormComponent],
  templateUrl: './stocks-list.component.html',
  styleUrl: './stocks-list.component.css'
})
export class StocksListComponent {
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent<Stock>;
  showModal = signal(false);
  tableConfig: TableConfig<Stock> = {
    columns: [
      { key: 'id', label: 'ID', sortable: true, width: '80px' },
      { key: 'name', label: 'Item Name', sortable: true },
      { key: 'client.name', label: 'Client', sortable: true },
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
    rowClickable: true
  };

  constructor(private router: Router) {}

  onRowClick(stock: Stock): void {
    this.router.navigate(['/stocks', stock.id]);
  }

  onCreateClick(): void {
    this.showModal.set(true);
  }

  onFormSaved(): void {
    this.showModal.set(false);
    this.dataTable.loadData();
  }

  onFormCancelled(): void {
    this.showModal.set(false);
  }
}
