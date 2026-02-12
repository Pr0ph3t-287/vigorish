import { Component, EventEmitter, Output, Input, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataTableService } from '../../../services/data-table.service';
import { CreateProjectRequest, Project } from '../../../models/project.models';
import { ProjectStatus } from '../../../models/project.models';
import { Client } from '../../../models/client.models';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css'
})
export class ProjectFormComponent implements OnInit {
  @Input() project?: Project;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  formData = signal<CreateProjectRequest>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: ProjectStatus.Pending,
    clientId: 0
  });

  clients = signal<Client[]>([]);
  projectStatuses = Object.entries(ProjectStatus)
    .filter(([key]) => !isNaN(Number(key)))
    .map(([key, value]) => ({ key: Number(key), value: String(value) }));

  isSubmitting = signal(false);
  error = signal<string | null>(null);

  constructor(private dataService: DataTableService) {}

  ngOnInit(): void {
    this.loadClients();
    if (this.project) {
      this.formData.set({
        name: this.project.name,
        description: this.project.description || '',
        startDate: this.project.startDate || '',
        endDate: this.project.endDate || '',
        status: this.project.status,
        clientId: this.project.clientId
      });
    }
  }

  get isEditMode(): boolean {
    return !!this.project;
  }

  loadClients(): void {
    this.dataService.getAll<Client>('/api/clients').subscribe({
      next: (clients) => this.clients.set(clients),
      error: () => this.error.set('Failed to load clients')
    });
  }

  onSubmit(): void {
    if (!this.formData().name.trim()) {
      this.error.set('Name is required');
      return;
    }
    if (this.formData().clientId === 0) {
      this.error.set('Please select a client');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const request = this.isEditMode
      ? this.dataService.update('/api/projects', this.project!.id, this.formData())
      : this.dataService.create('/api/projects', this.formData());

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} project`);
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  updateField<K extends keyof CreateProjectRequest>(field: K, value: any): void {
    this.formData.update(data => ({ ...data, [field]: value }));
  }
}
