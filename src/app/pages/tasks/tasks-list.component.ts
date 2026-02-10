import { Component, ViewChild, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { TaskFormComponent } from '../../components/forms/task-form/task-form.component';
import { TableConfig } from '../../models/data-table.models';
import { ProjectTask, TaskPriority, TaskItemStatus } from '../../models/task.models';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [DataTableComponent, TaskFormComponent],
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.css'
})
export class TasksListComponent {
  @ViewChild(DataTableComponent) dataTable!: DataTableComponent<ProjectTask>;
  showModal = signal(false);
  tableConfig: TableConfig<ProjectTask> = {
    columns: [
      { key: 'id', label: 'ID', sortable: true, width: '80px' },
      { key: 'title', label: 'Task', sortable: true },
      { key: 'project.name', label: 'Project', sortable: true },
      { key: 'project.client.name', label: 'Client', sortable: true },
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
    rowClickable: true
  };

  constructor(private router: Router) {}

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
