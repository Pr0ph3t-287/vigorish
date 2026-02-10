import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage.set('');
    this.isLoading.set(true);

    const credentials = {
      email: this.email(),
      password: this.password()
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 401) {
          this.errorMessage.set('Invalid email or password.');
        } else if (error.error?.message) {
          this.errorMessage.set(error.error.message);
        } else {
          this.errorMessage.set('An error occurred. Please try again.');
        }
      }
    });
  }
}
