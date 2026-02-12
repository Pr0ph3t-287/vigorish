import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  firstName = signal('');
  lastName = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage.set('');

    // Validation
    if (!this.email() || !this.password() || !this.firstName() || !this.lastName()) {
      this.errorMessage.set('All fields are required.');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    if (this.password().length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long.');
      return;
    }

    this.isLoading.set(true);

    const registerData = {
      email: this.email(),
      password: this.password(),
      firstName: this.firstName(),
      lastName: this.lastName()
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.error?.message) {
          this.errorMessage.set(error.error.message);
        } else {
          this.errorMessage.set('An error occurred during registration. Please try again.');
        }
      }
    });
  }
}
