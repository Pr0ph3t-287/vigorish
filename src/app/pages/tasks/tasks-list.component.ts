import { Component, ViewChild, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { TaskFormComponent } from '../../components/forms/task-form/task-form.component';
import { DataTableService } from '../../services/data-table.service';
import { AuthService } from '../../services/auth.service';
import { TableConfig } from '../../models/data-table.models';
import { ProjectTask, TaskPriority, TaskItemStatus } from '../../models/task.models';
import { Project } from '../../models/project.models';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [DataTableComponent, TaskFormComponent],
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.css'
})
export class TasksListComponent implements OnInit {
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent<ProjectTask>;
  showModal = signal(false);
  editingTask = signal<ProjectTask | undefined>(undefined);
  projects = signal<Project[]>([]);
  tableConfig: TableConfig<ProjectTask> = {
    columns: [
      { key: 'id', label: 'ID', sortable: true, width: '80px' },
      { key: 'title', label: 'Task', sortable: true },
      {
        key: 'projectId',
        label: 'Project',
        sortable: true,
        formatter: (value, row) => {
          const project = this.projects().find(p => p.id === row.projectId);
          return project?.name || `Project #${value}`;
        }
      },
      {
        key: 'projectId',
        label: 'Client',
        sortable: true,
        formatter: (_, row) => {
          const project = this.projects().find(p => p.id === row.projectId);
          return project?.client?.name || '-';
        }
      },
      {
        key: 'priority',
        label: 'Priority',
        sortable: true,
        searchable: false,
        formatter: (value) => this.getPriorityLabel(value)
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        searchable: false,
        formatter: (value) => this.getStatusLabel(value)
      },
      {
        key: 'dueDate',
        label: 'Due Date',
        sortable: true,
        searchable: false,
        formatter: (value) => value ? new Date(value).toLocaleDateString() : '-'
      }
    ],
    apiEndpoint: '/api/tasks',
    itemsPerPage: 10,
    searchPlaceholder: 'Search tasks...',
    showCreate: true,
    createButtonText: 'Add Task',
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
    this.loadProjects();
  }

  loadProjects(): void {
    this.dataService.getAll<Project>('/api/projects').subscribe({
      next: (projects) => this.projects.set(projects),
      error: (err) => console.error('Failed to load projects:', err)
    });
  }

  getPriorityLabel(priority: TaskPriority): string {
    const priorityLabels: Record<TaskPriority, string> = {
      [TaskPriority.Low]: '🟢 Low',
      [TaskPriority.Medium]: '🟡 Medium',
      [TaskPriority.High]: '🟠 High',
      [TaskPriority.Critical]: '🔴 Critical'
    };
    return priorityLabels[priority] || 'Unknown';
  }

  getStatusLabel(status: TaskItemStatus): string {
    const statusLabels: Record<TaskItemStatus, string> = {
      [TaskItemStatus.Todo]: '📋 To Do',
      [TaskItemStatus.InProgress]: '⚙️ In Progress',
      [TaskItemStatus.Done]: '✅ Done',
      [TaskItemStatus.Blocked]: '🚫 Blocked'
    };
    return statusLabels[status] || 'Unknown';
  }

  onRowClick(task: ProjectTask): void {
    this.router.navigate(['/tasks', task.id]);
  }

  onCreateClick(): void {
    this.editingTask.set(undefined);
    this.showModal.set(true);
  }

  onEditClick(task: ProjectTask): void {
    this.editingTask.set(task);
    this.showModal.set(true);
  }

  onDeleteClick(task: ProjectTask): void {
    if (confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      this.dataService.delete('/api/tasks', task.id).subscribe({
        next: () => {
          this.dataTable.loadData();
        },
        error: (err) => {
          alert(`Failed to delete task: ${err.error?.message || 'Unknown error'}`);
        }
      });
    }
  }

  onFormSaved(): void {
    this.showModal.set(false);
    this.editingTask.set(undefined);
    this.dataTable.loadData();
  }

  onFormCancelled(): void {
    this.showModal.set(false);
    this.editingTask.set(undefined);
  }
}
