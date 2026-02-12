import { Component, ViewChild, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { HorseFormComponent } from '../../components/forms/horse-form/horse-form.component';
import { DataTableService } from '../../services/data-table.service';
import { AuthService } from '../../services/auth.service';
import { TableConfig } from '../../models/data-table.models';
import { Horse } from '../../models/horse.models';
import { Client } from '../../models/client.models';

@Component({
  selector: 'app-horses-list',
  standalone: true,
  imports: [DataTableComponent, HorseFormComponent],
  templateUrl: './horses-list.component.html',
  styleUrl: './horses-list.component.css'
})
export class HorsesListComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent<Horse>;
  showModal = signal(false);
  editingHorse = signal<Horse | undefined>(undefined);
  clients = signal<Client[]>([]);
  tableConfig: TableConfig<Horse> = {
    columns: [
      { key: 'id', label: 'ID', sortable: true, width: '80px' },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'breed', label: 'Breed', sortable: true },
      {
        key: 'dateOfBirth',
        label: 'Date of Birth',
        sortable: true,
        formatter: (value) => value ? new Date(value).toLocaleDateString() : '-'
      },
      { key: 'gender', label: 'Gender', sortable: true },
      { key: 'color', label: 'Color', sortable: true },
      { key: 'registrationNumber', label: 'Registration #', sortable: true },
      {
        key: 'clientId',
        label: 'Client',
        sortable: true,
        formatter: (value, row) => {
          const client = this.clients().find(c => c.id === row.clientId);
          return client?.name || `Client #${value}`;
        }
      },
      {
        key: 'isActive',
        label: 'Status',
        sortable: true,
        formatter: (value) => value ? 'Active' : 'Inactive'
      }
    ],
    apiEndpoint: '/api/horses',
    itemsPerPage: 10,
    searchPlaceholder: 'Search horses...',
    showCreate: true,
    createButtonText: 'Add Horse',
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

  onRowClick(horse: Horse): void {
    this.router.navigate(['/horses', horse.id]);
  }

  onCreateClick(): void {
    this.editingHorse.set(undefined);
    this.showModal.set(true);
  }

  onEditClick(horse: Horse): void {
    this.editingHorse.set(horse);
    this.showModal.set(true);
  }

  onDeleteClick(horse: Horse): void {
    if (confirm(`Are you sure you want to delete horse "${horse.name}"?`)) {
      this.dataService.delete('/api/horses', horse.id!).subscribe({
        next: () => {
          this.dataTable.loadData();
        },
        error: (err) => {
          alert(`Failed to delete horse: ${err.error?.message || 'Unknown error'}`);
        }
      });
    }
  }

  onFormSaved(): void {
    this.showModal.set(false);
    this.editingHorse.set(undefined);
    this.dataTable.loadData();
  }

  onFormCancelled(): void {
    this.showModal.set(false);
    this.editingHorse.set(undefined);
  }
}
