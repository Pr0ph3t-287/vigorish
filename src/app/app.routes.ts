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

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'clients', component: ClientsListComponent },
  { path: 'projects', component: ProjectsListComponent },
  { path: 'horses', component: HorsesListComponent },
  { path: 'stocks', component: StocksListComponent },
  { path: 'tasks', component: TasksListComponent },
  { path: 'users', component: UsersListComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
];
