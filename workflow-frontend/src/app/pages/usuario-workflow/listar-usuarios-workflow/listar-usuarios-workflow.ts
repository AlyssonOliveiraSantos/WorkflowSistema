import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTablesModule, DataTableDirective } from 'angular-datatables';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';

import { UsuarioWorkflow } from '../../../models/UsuarioWorkflow';
import { Area } from '../../../models/Area';
import { UsuarioWorkflowService } from '../../../services/usuario-workflow.service';
import { AreaService } from '../../../services/area.service';

@Component({
  selector: 'app-listar-usuarios-workflow',
  standalone: true,
  imports: [CommonModule, DataTablesModule, FormsModule],
  templateUrl: './listar-usuarios-workflow.html',
  styleUrls: ['./listar-usuarios-workflow.scss']
})
export class ListarUsuariosWorkflowComponent implements OnInit, OnDestroy {
  usuarios: UsuarioWorkflow[] = [];
  detalheSelecionado?: UsuarioWorkflow;
  editarSelecionado?: UsuarioWorkflow;
  areas: Area[] = [];
  todasAreas: Area[] = [];
  showAreasDropdownEditar = false;
  inputAreaWidth = 0;

  dtOptions: any = {};
  dtTrigger: ReplaySubject<any> = new ReplaySubject<any>(1); 
  private destroyed$ = new Subject<void>();

  confirmarExclusao?: UsuarioWorkflow | null = null;

  @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;
  @ViewChild('inputArea', { static: false }) inputArea!: ElementRef<HTMLInputElement>;

  constructor(
    private usuarioService: UsuarioWorkflowService,
    private areaService: AreaService
  ) {}

  ngOnInit(): void {
    this.carregarAreas();
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
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  carregarAreas(): void {
    this.areaService.getAreas()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.todasAreas = res;
        this.areas = res.slice(0, 5);
        this.carregarUsuarios();
      });
  }

  carregarUsuarios(): void {
    this.usuarioService.getUsuarios()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (usuarios: UsuarioWorkflow[]) => {
          this.usuarios = usuarios.map(u => {
            const area = this.todasAreas.find(a => a.id === u.areaId);
            return { ...u, areaNome: area ? area.nome : 'Não definida' };
          });

          if (this.dtElement?.dtInstance) {
            this.dtElement.dtInstance.then(dtInstance => {
              dtInstance.destroy();
              this.dtTrigger.next(null);
            });
          } else {
            this.dtTrigger.next(null);
          }
        },
        error: err => console.error('Erro ao carregar usuários:', err)
      });
  }

  abrirDetalhes(usuario: UsuarioWorkflow): void {
    this.detalheSelecionado = usuario;
  }

  fecharDetalhes(): void {
    this.detalheSelecionado = undefined;
  }

  abrirEditar(usuario: UsuarioWorkflow): void {
    this.editarSelecionado = { ...usuario };
    this.showAreasDropdownEditar = false;
  }

  fecharEditar(): void {
    this.editarSelecionado = undefined;
    this.showAreasDropdownEditar = false;
  }

  buscarAreas(query: string) {
    this.areas = !query
      ? this.todasAreas.slice(0, 5)
      : this.todasAreas.filter(a => a.nome.toLowerCase().includes(query.toLowerCase()));
    this.showAreasDropdownEditar = true;
  }

  selecionarAreaEditar(area: Area) {
    if (!this.editarSelecionado) return;
    this.editarSelecionado.areaId = area.id;
    this.editarSelecionado.areaNome = area.nome;
    this.showAreasDropdownEditar = false;
  }

  getAreaNomeEditar(): string {
    if (!this.editarSelecionado?.areaId) return '';
    const area = this.todasAreas.find(a => a.id === this.editarSelecionado?.areaId);
    return area ? area.nome : (this.editarSelecionado.areaNome ?? '');
  }

  salvarEdicao(): void {
    if (!this.editarSelecionado) return;

    const payload: UsuarioWorkflow = { ...this.editarSelecionado };

    this.usuarioService.atualizarUsuario(payload.id, payload).subscribe({
      next: () => {
        const index = this.usuarios.findIndex(u => u.id === this.editarSelecionado!.id);
        if (index !== -1) this.usuarios[index] = { ...this.editarSelecionado! };

        if (this.dtElement?.dtInstance) {
          this.dtElement.dtInstance.then(dtInstance => {
            dtInstance.destroy();
            this.dtTrigger.next(null);
          });
        }

        this.fecharEditar();
      },
      error: err => console.error('Erro ao atualizar usuário:', err)
    });
  }

  abrirModalDeletar(usuario: UsuarioWorkflow) {
    this.confirmarExclusao = usuario;
  }

  cancelarExclusao() {
    this.confirmarExclusao = null;
  }

  confirmarDeletar() {
    if (!this.confirmarExclusao) return;

    const id = this.confirmarExclusao.id;
    this.usuarioService.deletarUsuario(id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.id !== id);
        this.confirmarExclusao = null;
      },
      error: err => console.error('Erro ao deletar usuário:', err)
    });
  }

  onWindowResize() {
    if (this.inputArea) this.inputAreaWidth = this.inputArea.nativeElement.offsetWidth;
  }
  
  showAtivoDropdown = false;

selecionarAtivo(valor: boolean) {
  if (!this.editarSelecionado) return;
  this.editarSelecionado.ativo = valor;
  this.showAtivoDropdown = false;
}
}
