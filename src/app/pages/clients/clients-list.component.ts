import { Component, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { ClientFormComponent } from '../../components/forms/client-form/client-form.component';
import { TableConfig } from '../../models/data-table.models';
import { Client } from '../../models/client.models';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [DataTableComponent, ClientFormComponent, CommonModule],
  templateUrl: './clients-list.component.html',
  styleUrl: './clients-list.component.css'
})
export class ClientsListComponent {
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent<Client>;

  showModal = signal(false);
  tableConfig: TableConfig<Client> = {
    columns: [
      { key: 'id', label: 'ID', sortable: true, width: '80px' },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      { key: 'phone', label: 'Phone', sortable: true },
      { key: 'address', label: 'Address', sortable: true },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        searchable: false,
        formatter: (value) => value ? new Date(value).toLocaleDateString() : '-'
      },
      {
        key: 'isActive',
        label: 'Status',
        sortable: true,
        searchable: false,
        formatter: (value) => value ? '✓ Active' : '✗ Inactive'
      }
    ],
    apiEndpoint: '/api/clients',
    itemsPerPage: 10,
    searchPlaceholder: 'Search clients...',
    showCreate: true,
    createButtonText: 'Add Client',
    rowClickable: true
  };

  constructor(private router: Router) {}

  onRowClick(client: Client): void {
    this.router.navigate(['/clients', client.id]);
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
