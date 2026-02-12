import { Component, signal, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { ProjectFormComponent } from '../../components/forms/project-form/project-form.component';
import { DataTableService } from '../../services/data-table.service';
import { AuthService } from '../../services/auth.service';
import { TableConfig } from '../../models/data-table.models';
import { Project, ProjectStatus } from '../../models/project.models';
import { Client } from '../../models/client.models';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [DataTableComponent, ProjectFormComponent, CommonModule],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.css'
})
export class ProjectsListComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent<Project>;
  showModal = signal(false);
  editingProject = signal<Project | undefined>(undefined);
  clients = signal<Client[]>([]);
  tableConfig: TableConfig<Project> = {
    columns: [
      { key: 'id', label: 'ID', sortable: true, width: '80px' },
      { key: 'name', label: 'Project Name', sortable: true },
      {
        key: 'clientId',
        label: 'Client',
        sortable: true,
        formatter: (value, row) => {
          const client = this.clients().find(c => c.id === row.clientId);
          return client?.name || `Client #${value}`;
        }
      },
      { key: 'description', label: 'Description', sortable: false },
      {
        key: 'startDate',
        label: 'Start Date',
        sortable: true,
        searchable: false,
        formatter: (value) => value ? new Date(value).toLocaleDateString() : '-'
      },
      {
        key: 'endDate',
        label: 'End Date',
        sortable: true,
        searchable: false,
        formatter: (value) => value ? new Date(value).toLocaleDateString() : '-'
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        searchable: false,
        formatter: (value) => this.getStatusLabel(value)
      }
    ],
    apiEndpoint: '/api/projects',
    itemsPerPage: 10,
    searchPlaceholder: 'Search projects...',
    showCreate: true,
    createButtonText: 'Add Project',
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

  getStatusLabel(status: ProjectStatus): string {
    const statusLabels: Record<ProjectStatus, string> = {
      [ProjectStatus.Pending]: '⏳ Pending',
      [ProjectStatus.InProgress]: '🔄 In Progress',
      [ProjectStatus.Completed]: '✅ Completed',
      [ProjectStatus.OnHold]: '⏸️ On Hold',
      [ProjectStatus.Cancelled]: '❌ Cancelled'
    };
    return statusLabels[status] || 'Unknown';
  }

  onRowClick(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }

  onCreateClick(): void {
    this.editingProject.set(undefined);
    this.showModal.set(true);
  }

  onEditClick(project: Project): void {
    this.editingProject.set(project);
    this.showModal.set(true);
  }

  onDeleteClick(project: Project): void {
    if (confirm(`Are you sure you want to delete project "${project.name}"?`)) {
      this.dataService.delete('/api/projects', project.id).subscribe({
        next: () => {
          this.dataTable.loadData();
        },
        error: (err) => {
          alert(`Failed to delete project: ${err.error?.message || 'Unknown error'}`);
        }
      });
    }
  }

  onFormSaved(): void {
    this.showModal.set(false);
    this.editingProject.set(undefined);
    this.dataTable.loadData();
  }

  onFormCancelled(): void {
    this.showModal.set(false);
    this.editingProject.set(undefined);
  }
}
