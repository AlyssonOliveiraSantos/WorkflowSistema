import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTablesModule, DataTableDirective } from 'angular-datatables';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';

import { SolicitacaoAcessoPrograma } from '../../../models/Solicitacao-acesso-programa';
import { SolicitacaoAcessoService } from '../../../services/solicitacao-acesso-programa.service';

@Component({
  selector: 'app-solicitacoes-acesso-programa',
  standalone: true,
  imports: [CommonModule, DataTablesModule, FormsModule],
  templateUrl: './solicitacoes-acesso-programa.html',
  styleUrls: ['./solicitacoes-acesso-programa.scss']
})
export class SolicitacoesAcessoProgramaComponent implements OnInit, OnDestroy {
  solicitacoes: SolicitacaoAcessoPrograma[] = [];
  detalheSelecionado?: SolicitacaoAcessoPrograma;
  editarSelecionado?: SolicitacaoAcessoPrograma;

  dtOptions: any = {};
  dtTrigger: ReplaySubject<any> = new ReplaySubject<any>(1);
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
    this.solicitacaoService.getSolicitacoes()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (data) => {
          this.solicitacoes = data;

          if (this.dtElement?.dtInstance) {
            this.dtElement.dtInstance.then((dtInstance: any) => {
              dtInstance.destroy();
              this.dtTrigger.next(null);
            });
          } else {
            this.dtTrigger.next(null);
          }
        },
        error: (err) => console.error('Erro ao buscar solicitações:', err)
      });
  }


  abrirDetalhes(solicitacao: SolicitacaoAcessoPrograma): void {
    this.detalheSelecionado = solicitacao;
  }

  fecharDetalhes(): void {
    this.detalheSelecionado = undefined;
  }

 
  abrirEditar(solicitacao: SolicitacaoAcessoPrograma): void {
    this.editarSelecionado = { ...solicitacao };
  }

  fecharEditar(): void {
    this.editarSelecionado = undefined;
  }

  salvarEdicao(): void {
    if (!this.editarSelecionado) return;


    console.log('Salvando edição:', this.editarSelecionado);


    const index = this.solicitacoes.findIndex(a => a.id === this.editarSelecionado!.id);
    if (index !== -1) {
      this.solicitacoes[index] = { ...this.editarSelecionado };
    }

    this.fecharEditar();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
