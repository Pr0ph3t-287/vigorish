import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { HorsesListComponent } from './pages/horses/horses-list.component';
import { ClientsListComponent } from './pages/clients/clients-list.component';
import { ProjectsListComponent } from './pages/projects/projects-list.component';
import { StocksListComponent } from './pages/stocks/stocks-list.component';
import { TasksListComponent } from './pages/tasks/tasks-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'clients', component: ClientsListComponent },
  { path: 'projects', component: ProjectsListComponent },
  { path: 'horses', component: HorsesListComponent },
  { path: 'stocks', component: StocksListComponent },
  { path: 'tasks', component: TasksListComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
