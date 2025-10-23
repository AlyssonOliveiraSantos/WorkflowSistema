import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

interface Tab {
  label: string;
  subTabs?: string[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent {
  tabs: Tab[] = [
    { label: 'Usuarios Workflow', subTabs: ['Criar Novo Usuario Workflow', 'Listar Todos UsuariosWorkflow'] },
    { label: 'Solicitações', subTabs: ['Criar Nova', 'Pendentes Aprovação', 'Todas Solicitações'] },
    { label: 'Áreas', subTabs: ['Criar Nova Area','Listar Todas'] },
    { label: 'Programas', subTabs: ['Criar Novo Programa', 'Listar Todos Programas'] },
    { label: 'Usuários', subTabs: ['Criar Novo Usuario', 'Listar Todos Usuarios'] }
  ];

  constructor(public auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    window.location.reload();
  }

  get username(): string | null {
    return this.auth.getUsername();
  }

navigateTo(subLabel: string) {
  switch(subLabel) {
    case 'Todas Solicitações':
      this.router.navigate(['/dashboard/todas-solicitacoes']);
      break;
    case 'Criar Nova':
      this.router.navigate(['/dashboard/criar-nova']);
      break;
    case 'Pendentes Aprovação':
      this.router.navigate(['/dashboard/pendentes-aprovacao']);
      break;
    case 'Listar Todas':         // Áreas
      this.router.navigate(['/dashboard/areas']);
      break;
    case 'Criar Nova Area':
      this.router.navigate(['/dashboard/criar-areas']);
      break;
    case 'Listar Todos Programas':
      this.router.navigate(['/dashboard/programas']);
      break;
      case 'Criar Novo Programa':
      this.router.navigate(['/dashboard/criar-programa']);
      break;
      case 'Criar Novo Usuario Workflow':
      this.router.navigate(['/dashboard/criar-usuario-workflow']);
      break;
      case 'Listar Todos UsuariosWorkflow':
      this.router.navigate(['/dashboard/usuario-workflow']);
      break;
      case 'Criar Novo Usuario':
      this.router.navigate(['/dashboard/criar-usuario']);
      break;
      case 'Listar Todos Usuarios':
      this.router.navigate(['/dashboard/usuario']);
      break;
    default:
      console.warn('Rota não definida para:', subLabel);
  }

    
  }
}
