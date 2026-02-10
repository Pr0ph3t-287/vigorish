import { Component, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableService } from '../../../services/data-table.service';
import { CreateTaskRequest, TaskPriority, TaskItemStatus } from '../../../models/task.models';
import { Project } from '../../../models/project.models';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export class TaskFormComponent implements OnInit {
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  formData = signal<CreateTaskRequest>({
    title: '',
    description: '',
    dueDate: '',
    priority: TaskPriority.Medium,
    status: TaskItemStatus.Todo,
    projectId: 0
  });

  projects = signal<Project[]>([]);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  // Expose enums to template
  TaskPriority = TaskPriority;
  TaskItemStatus = TaskItemStatus;

  // Priority labels with emojis
  priorityLabels: Record<TaskPriority, string> = {
    [TaskPriority.Low]: '🟢 Low',
    [TaskPriority.Medium]: '🟡 Medium',
    [TaskPriority.High]: '🟠 High',
    [TaskPriority.Critical]: '🔴 Critical'
  };

  // Status labels with emojis
  statusLabels: Record<TaskItemStatus, string> = {
    [TaskItemStatus.Todo]: '📋 To Do',
    [TaskItemStatus.InProgress]: '⚙️ In Progress',
    [TaskItemStatus.Done]: '✅ Done',
    [TaskItemStatus.Blocked]: '🚫 Blocked'
  };

  constructor(private dataService: DataTableService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.dataService.getAll<Project>('/api/projects').subscribe({
      next: (projects) => this.projects.set(projects),
      error: (error) => {
        console.error('Failed to load projects:', error);
        this.error.set('Failed to load projects. Please try again.');
      }
    });
  }

  updateField(field: keyof CreateTaskRequest, value: any): void {
    this.formData.update(data => ({ ...data, [field]: value }));
  }

  onSubmit(): void {
    this.error.set(null);

    // Validate required fields
    if (!this.formData().title.trim()) {
      this.error.set('Title is required');
      return;
    }

    if (!this.formData().projectId || this.formData().projectId === 0) {
      this.error.set('Please select a project');
      return;
    }

    this.isSubmitting.set(true);

    this.dataService.create('/api/tasks', this.formData()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: (error) => {
        console.error('Failed to create task:', error);
        this.error.set(error.error?.message || 'Failed to create task. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  // Helper to get priority options as array
  get priorityOptions(): { value: TaskPriority; label: string }[] {
    return Object.keys(TaskPriority)
      .filter(key => !isNaN(Number(key)))
      .map(key => ({
        value: Number(key) as TaskPriority,
        label: this.priorityLabels[Number(key) as TaskPriority]
      }));
  }

  // Helper to get status options as array
  get statusOptions(): { value: TaskItemStatus; label: string }[] {
    return Object.keys(TaskItemStatus)
      .filter(key => !isNaN(Number(key)))
      .map(key => ({
        value: Number(key) as TaskItemStatus,
        label: this.statusLabels[Number(key) as TaskItemStatus]
      }));
  }
}
