import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { SolicitacoesAcessoProgramaComponent } from './pages/solicitacao-programa/solicitacoes-acesso-programa/solicitacoes-acesso-programa';
import { CriarSolicitacaoComponent } from './pages/solicitacao-programa/criar-solicitacao/criar-solicitacao';
import { SolicitacoesPendentesComponent } from './pages/solicitacao-programa/pendentes-solicitacao/pendentes-solicitacao';
import { authGuard, roleGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
  path: 'dashboard',
  loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
  canActivate: [authGuard],
  children: [
    {
      path: 'todas-solicitacoes',
      loadComponent: () => import('./pages/solicitacao-programa/solicitacoes-acesso-programa/solicitacoes-acesso-programa')
                        .then(m => m.SolicitacoesAcessoProgramaComponent)
    },
    {
      path: 'criar-nova',
      loadComponent: () => import('./pages/solicitacao-programa/criar-solicitacao/criar-solicitacao')
                        .then(m => m.CriarSolicitacaoComponent)
    },
    {
      path: 'minhas-solicitacoes',
      loadComponent: () => import('./pages/solicitacao-programa/solicitacoes-acesso-programa/solicitacoes-acesso-programa')
                        .then(m => m.SolicitacoesAcessoProgramaComponent)
    },
    {
      path: 'pendentes-aprovacao',
      loadComponent: () => import('./pages/solicitacao-programa/pendentes-solicitacao/pendentes-solicitacao')
                        .then(m => m.SolicitacoesPendentesComponent)
    },
    { path: '', redirectTo: 'areas', pathMatch: 'full' },
{
  path: 'areas',
  loadComponent: () => import('./pages/area/listar-areas/listar-areas')
                       .then(m => m.ListarAreasComponent),
  canActivate: [authGuard] 
},
{
  path: 'criar-areas',
  loadComponent: () => import('./pages/area/criar-area/criar-area')
                       .then(m => m.CriarAreaComponent),
  canActivate: [authGuard] 
},
{
  path: 'programas',
  loadComponent: () => import('./pages/programas/listar-programas/listar-programas')
                       .then(m => m.ListarProgramasComponent),
  canActivate: [authGuard] 
},
{
  path: 'criar-programa',
  loadComponent: () => import('./pages/programas/criar-programa/criar-programa')
                       .then(m => m.CriarProgramaComponent),
  canActivate: [authGuard] 
},
{
  path: 'usuario-workflow',
  loadComponent: () => import('./pages/usuario-workflow/listar-usuarios-workflow/listar-usuarios-workflow')
                       .then(m => m.ListarUsuariosWorkflowComponent),
  canActivate: [authGuard] 
},
{
  path: 'criar-usuario-workflow',
  loadComponent: () => import('./pages/usuario-workflow/criar-usuario-workflow/criar-usuario-workflow')
                       .then(m => m.CriarUsuarioWorkflowComponent),
  canActivate: [authGuard] 
},
{
  path: 'usuario',
  loadComponent: () => import('./pages/usuarios/listar-usuarios/listar-usuarios')
                       .then(m => m.ListarUsuariosComponent),
  canActivate: [authGuard] 
},
{
  path: 'criar-usuario',
  loadComponent: () => import('./pages/usuarios/criar-usuario/criar-usuario')
                       .then(m => m.CriarUsuarioComponent),
  canActivate: [authGuard] 
}
  ]
},

  {
    path: 'admin',
    component: DashboardComponent,
    canActivate: [roleGuard('Admin')],
    children: [
    ]
  },

  { path: '**', redirectTo: 'login' }
];
