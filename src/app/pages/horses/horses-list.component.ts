import { Component, ViewChild, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { HorseFormComponent } from '../../components/forms/horse-form/horse-form.component';
import { TableConfig } from '../../models/data-table.models';
import { Horse } from '../../models/horse.models';

@Component({
  selector: 'app-horses-list',
  standalone: true,
  imports: [DataTableComponent, HorseFormComponent],
  templateUrl: './horses-list.component.html',
  styleUrl: './horses-list.component.css'
})
export class HorsesListComponent {
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent<Horse>;
  showModal = signal(false);
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
      { key: 'client.name', label: 'Client', sortable: true },
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
    rowClickable: true
  };

  constructor(private router: Router) {}

  onRowClick(horse: Horse): void {
    this.router.navigate(['/horses', horse.id]);
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
