import { Component, signal, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('vigorish');
  private currentRoute = signal('');

  constructor(private router: Router) {
    // Track current route
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentRoute.set(event.urlAfterRedirects);
      });
  }

  // Show navbar on all pages except login, register
  showNavbar = computed(() => {
    return !this.currentRoute().includes('/login') && !this.currentRoute().includes('/register');
  });
}
