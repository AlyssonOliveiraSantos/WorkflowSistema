import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitacaoAcessoPrograma } from '../../models/Solicitacao-acesso-programa';
import { SolicitacaoAcessoService } from '../../services/solicitacao-acesso-programa.service';

@Component({
  selector: 'app-solicitacoes-acesso-programa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitacoes-acesso-programa.html',
  styleUrls: ['./solicitacoes-acesso-programa.scss']
})
export class SolicitacoesAcessoProgramaComponent implements OnInit {
  solicitacoes: SolicitacaoAcessoPrograma[] = [];
  detalheSelecionado?: SolicitacaoAcessoPrograma; // para o modal

  constructor(private solicitacaoService: SolicitacaoAcessoService) {}

  ngOnInit(): void {
    this.solicitacaoService.getSolicitacoes().subscribe({
      next: (data) => this.solicitacoes = data,
      error: (err) => console.error('Erro ao buscar solicitações:', err)
    });
  }

  abrirDetalhes(solicitacao: SolicitacaoAcessoPrograma) {
    this.detalheSelecionado = solicitacao;
  }

  fecharDetalhes() {
    this.detalheSelecionado = undefined;
  }
}
