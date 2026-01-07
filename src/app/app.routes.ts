import { Routes } from '@angular/router';
import { TaskComponent } from './task/task';
import { LoginComponent } from './login/login';

export const routes: Routes = [
 { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'tasks', component: TaskComponent }
];


