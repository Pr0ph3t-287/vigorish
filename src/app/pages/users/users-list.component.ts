import { Component, ViewChild, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { UserFormComponent } from '../../components/forms/user-form/user-form.component';
import { DataTableService } from '../../services/data-table.service';
import { AuthService } from '../../services/auth.service';
import { TableConfig } from '../../models/data-table.models';
import { User } from '../../models/user.models';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [DataTableComponent, UserFormComponent],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent {
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent<User>;
  showModal = signal(false);
  editingUser = signal<User | undefined>(undefined);

  tableConfig: TableConfig<User> = {
    columns: [
      { key: 'firstName', label: 'First Name', sortable: true },
      { key: 'lastName', label: 'Last Name', sortable: true },
      { key: 'email', label: 'Email', sortable: true },
      {
        key: 'roles',
        label: 'Roles',
        sortable: false,
        searchable: false,
        formatter: (value) => {
          const roles = value as string[];
          return roles.length > 0 ? roles.join(', ') : '-';
        },
      },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        searchable: false,
        formatter: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
      },
      {
        key: 'lastLoginAt',
        label: 'Last Login',
        sortable: true,
        searchable: false,
        formatter: (value) => (value ? new Date(value).toLocaleDateString() : 'Never'),
      },
      {
        key: 'isActive',
        label: 'Status',
        sortable: true,
        searchable: false,
        formatter: (value) => (value ? '✓ Active' : '✗ Inactive'),
      },
    ],
    apiEndpoint: '/api/users',
    itemsPerPage: 10,
    searchPlaceholder: 'Search users...',
    showCreate: false,
    rowClickable: false,
    showActions: true,
    showEdit: true,
    showDelete: false,
  };

  constructor(
    private router: Router,
    private dataService: DataTableService,
    private authService: AuthService,
  ) {
    // Show delete button only for Admin users
    this.tableConfig.showDelete = this.authService.isAdmin();
  }

  onRowClick(user: User): void {
    this.router.navigate(['/users', user.id]);
  }

  onEditClick(user: User): void {
    this.editingUser.set(user);
    this.showModal.set(true);
  }

  onDeleteClick(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.firstName} ${user.lastName}"?`)) {
      this.dataService.delete('/api/users', user.id).subscribe({
        next: () => {
          this.dataTable.loadData();
        },
        error: (err) => {
          alert(`Failed to delete user: ${err.error?.message || 'Unknown error'}`);
        },
      });
    }
  }

  onFormSaved(): void {
    this.showModal.set(false);
    this.editingUser.set(undefined);
    this.dataTable.loadData();
  }

  onFormCancelled(): void {
    this.showModal.set(false);
    this.editingUser.set(undefined);
  }
}
