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
    { label: 'Usuarios Workflow', subTabs: ['Adicionar Novo', 'Alterar', 'Vincular Area', 'Deletar'] },
    { label: 'Solicitações', subTabs: ['Criar Nova', 'Minhas Solicitações', 'Pendentes Aprovação', 'Todas Solicitações'] },
    { label: 'Áreas', subTabs: ['Criar Nova Area','Alterar Area','Cadastrar Responsavel', 'Deletar Area'] },
    { label: 'Programas', subTabs: ['Criar Novo Programa', 'Alterar Programa', 'Adicionar Area', 'Deletar Programa'] },
    { label: 'Usuários', subTabs: ['Adicionar Novo', 'Alterar Existente', 'Vincular', 'Alterar Permissoes', 'Deletar Usuario'] }
  ];

  constructor(public auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    window.location.reload();
  }

  get username(): string | null {
    return this.auth.getUsername();
  }

  // Função para mapear cada subtab para a rota correta
  navigateTo(subLabel: string) {
    switch(subLabel) {
      case 'Todas Solicitações':
        this.router.navigate(['/dashboard/todas-solicitacoes']);
        break;
      case 'Criar Nova':
        this.router.navigate(['/dashboard/criar-nova']);
        break;
      case 'Minhas Solicitações':
        this.router.navigate(['/dashboard/minhas-solicitacoes']);
        break;
      case 'Pendentes Aprovação':
        this.router.navigate(['/dashboard/pendentes-aprovacao']);
        break;
      // mapeie outras subtabs aqui...
      default:
        console.warn('Rota não definida para:', subLabel);
    }
  }
}
