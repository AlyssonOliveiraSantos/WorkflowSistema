import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { SolicitacoesAcessoProgramaComponent } from './pages/solicitacoes-acesso-programa/solicitacoes-acesso-programa';
import { authGuard, roleGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'todas-solicitacoes', component: SolicitacoesAcessoProgramaComponent },
      { path: 'criar-nova', component: SolicitacoesAcessoProgramaComponent },
      { path: 'minhas-solicitacoes', component: SolicitacoesAcessoProgramaComponent },
      { path: 'pendentes-aprovacao', component: SolicitacoesAcessoProgramaComponent },
      { path: '', redirectTo: 'todas-solicitacoes', pathMatch: 'full' }
    ]
  },

  {
    path: 'admin',
    component: DashboardComponent,
    canActivate: [roleGuard('Admin')],
    children: [
      // rotas restritas a admin
    ]
  },

  { path: '**', redirectTo: 'login' }
];
