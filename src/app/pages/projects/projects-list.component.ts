import { Component, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { ProjectFormComponent } from '../../components/forms/project-form/project-form.component';
import { TableConfig } from '../../models/data-table.models';
import { Project, ProjectStatus } from '../../models/project.models';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [DataTableComponent, ProjectFormComponent, CommonModule],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.css'
})
export class ProjectsListComponent {
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent<Project>;
  showModal = signal(false);
  tableConfig: TableConfig<Project> = {
    columns: [
      { key: 'id', label: 'ID', sortable: true, width: '80px' },
      { key: 'name', label: 'Project Name', sortable: true },
      { key: 'client.name', label: 'Client', sortable: true },
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
    rowClickable: true
  };

  constructor(private router: Router) {}

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
