import { Component, OnInit, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableService } from '../../../services/data-table.service';
import { User, UpdateUserRequest } from '../../../models/user.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css',
})
export class UserFormComponent implements OnInit {
  @Input() user?: User;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  formData = signal<UpdateUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    isActive: true,
    roles: [],
  });

  availableRoles = signal<string[]>([]);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  constructor(private dataService: DataTableService) {}

  ngOnInit(): void {
    this.loadRoles();
    if (this.user) {
      this.formData.set({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        isActive: this.user.isActive,
        roles: [...this.user.roles],
      });
    }
  }

  get isEditMode(): boolean {
    return !!this.user;
  }

  loadRoles(): void {
    this.dataService.getAll<string>('/api/roles').subscribe({
      next: (roles) => this.availableRoles.set(roles),
      error: (error) => {
        console.error('Failed to load roles:', error);
        this.error.set('Failed to load roles. Please try again.');
      },
    });
  }

  updateField(field: keyof UpdateUserRequest, value: any): void {
    this.formData.update((data) => ({ ...data, [field]: value }));
  }

  toggleRole(role: string): void {
    this.formData.update((data) => {
      const roles = data.roles || [];
      const index = roles.indexOf(role);
      if (index > -1) {
        return { ...data, roles: roles.filter((r) => r !== role) };
      } else {
        return { ...data, roles: [...roles, role] };
      }
    });
  }

  isRoleSelected(role: string): boolean {
    return this.formData().roles?.includes(role) || false;
  }

  onSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    this.error.set(null);

    // Validate required fields
    if (!this.formData().firstName?.trim()) {
      this.error.set('First name is required');
      return;
    }

    if (!this.formData().lastName?.trim()) {
      this.error.set('Last name is required');
      return;
    }

    if (!this.formData().email?.trim()) {
      this.error.set('Email is required');
      return;
    }

    this.isSubmitting.set(true);

    // Only update endpoint exists
    const request = this.dataService.update('/api/users', this.user!.id, this.formData());

    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: (error) => {
        console.error('Failed to update user:', error);
        this.error.set(error.error?.message || 'Failed to update user. Please try again.');
        this.isSubmitting.set(false);
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
