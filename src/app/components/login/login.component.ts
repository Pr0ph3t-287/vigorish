import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);
  returnUrl: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Get return url from route parameters or default to '/home'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

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
        this.router.navigateByUrl(this.returnUrl);
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
