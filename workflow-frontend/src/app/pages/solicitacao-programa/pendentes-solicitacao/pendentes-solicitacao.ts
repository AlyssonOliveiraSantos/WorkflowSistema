import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTablesModule, DataTableDirective } from 'angular-datatables';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';

import { SolicitacaoAcessoPrograma } from '../../../models/Solicitacao-acesso-programa';
import { SolicitacaoAcessoService } from '../../../services/solicitacao-acesso-programa.service';

@Component({
  selector: 'app-pendentes-solicitacao',
  standalone: true,
  imports: [CommonModule, DataTablesModule, FormsModule],
  templateUrl: './pendentes-solicitacao.html',
  styleUrls: ['./pendentes-solicitacao.scss']
})
export class SolicitacoesPendentesComponent implements OnInit, OnDestroy {
  solicitacoes: SolicitacaoAcessoPrograma[] = [];
  detalheSelecionado?: SolicitacaoAcessoPrograma;

  dtOptions: any = {};
  dtTrigger: ReplaySubject<any> = new ReplaySubject<any>(1);

  // Modal de decisão
  decisaoModal: boolean = false;
  decisaoAprovada: boolean = true;
  observacao: string = '';

  private destroyed$ = new Subject<void>();

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  constructor(private solicitacaoService: SolicitacaoAcessoService) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 20,
      lengthChange: false,
      processing: true,
      searching: true,
      language: {
        search: "Pesquisar:",
        info: "Mostrando _START_ até _END_ de _TOTAL_ registros",
        paginate: {
          first: "Primeiro",
          last: "Último",
          next: "Próximo",
          previous: "Anterior"
        }
      },
      drawCallback: () => {
        const paginate = document.querySelector('.dataTables_paginate') as HTMLElement;
        if (paginate) paginate.style.backgroundColor = 'transparent';
      }
    };

    this.carregarSolicitacoes();
  }

  carregarSolicitacoes(): void {
    this.solicitacaoService.getSolicitacoesPendentes()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (data) => {
          this.solicitacoes = data;

          if (this.dtElement?.dtInstance) {
            this.dtElement.dtInstance.then((dtInstance: any) => {
              dtInstance.destroy();
              this.dtTrigger.next(null);
              setTimeout(() => {
                const paginate = document.querySelector('.dataTables_paginate') as HTMLElement;
                if (paginate) paginate.style.backgroundColor = 'transparent';
              }, 0);
            });
          } else {
            this.dtTrigger.next(null);
            setTimeout(() => {
              const paginate = document.querySelector('.dataTables_paginate') as HTMLElement;
              if (paginate) paginate.style.backgroundColor = 'transparent';
            }, 0);
          }
        },
        error: (err) => console.error('Erro ao buscar solicitações:', err)
      });
  }

  abrirDetalhes(solicitacao: SolicitacaoAcessoPrograma) {
    this.detalheSelecionado = solicitacao;
    this.decisaoModal = false;
  }

  fecharDetalhes(): void {
    this.detalheSelecionado = undefined;
  }

  abrirDecisao(solicitacao: SolicitacaoAcessoPrograma, aprovar: boolean): void {
    this.detalheSelecionado = solicitacao;
    this.decisaoAprovada = aprovar;
    this.observacao = '';
    this.decisaoModal = true;
  }

  fecharDecisao(): void {
    this.decisaoModal = false;
    this.detalheSelecionado = undefined;
    this.observacao = '';
  }

  confirmarDecisaoDireta(solicitacao: SolicitacaoAcessoPrograma, aprovado: boolean) {
    const tipo = this.getTipoDecisao(solicitacao);

    this.solicitacaoService.decidirSolicitacao(solicitacao.id, tipo, aprovado, '')
      .subscribe({
        next: () => {
          console.log('Decisão enviada com sucesso');
          this.carregarSolicitacoes(); 
        },
        error: err => console.error('Erro ao decidir:', err)
      });
    this.fecharDecisao();
  }

  private getTipoDecisao(solicitacao: SolicitacaoAcessoPrograma): number {
    if (!solicitacao.aprovadoGerente) return 1;
    if (!solicitacao.aprovadoResponsavelPrograma) return 2; 
    return 3; 
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
