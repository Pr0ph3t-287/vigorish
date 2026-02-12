import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { HorsesListComponent } from './pages/horses/horses-list.component';
import { ClientsListComponent } from './pages/clients/clients-list.component';
import { ProjectsListComponent } from './pages/projects/projects-list.component';
import { StocksListComponent } from './pages/stocks/stocks-list.component';
import { TasksListComponent } from './pages/tasks/tasks-list.component';
import { UsersListComponent } from './pages/users/users-list.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'clients', component: ClientsListComponent, canActivate: [authGuard] },
  { path: 'projects', component: ProjectsListComponent, canActivate: [authGuard] },
  { path: 'horses', component: HorsesListComponent, canActivate: [authGuard] },
  { path: 'stocks', component: StocksListComponent, canActivate: [authGuard] },
  { path: 'tasks', component: TasksListComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersListComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home', pathMatch: 'full' },
];
