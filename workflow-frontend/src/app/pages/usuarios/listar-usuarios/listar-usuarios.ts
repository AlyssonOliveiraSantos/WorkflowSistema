import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTablesModule, DataTableDirective } from 'angular-datatables';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';

import { Usuario } from '../../../models/Usuario';
import { UsuarioWorkflow } from '../../../models/UsuarioWorkflow';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioWorkflowService } from '../../../services/usuario-workflow.service'; 

@Component({
  selector: 'app-listar-usuarios',
  standalone: true,
  imports: [CommonModule, DataTablesModule, FormsModule],
  templateUrl: './listar-usuarios.html',
  styleUrls: ['./listar-usuarios.scss']
})
export class ListarUsuariosComponent implements OnInit, OnDestroy {
  usuarios: Usuario[] = [];
  usuariosWorkflow: UsuarioWorkflow[] = [];
  todasUsuariosWorkflow: UsuarioWorkflow[] = [];

  detalheSelecionado?: Usuario;
  editarSelecionado?: Usuario;

  showWorkflowDropdownEditar = false;
  inputWorkflowWidth = 0;

  dtOptions: any = {};
  dtTrigger: ReplaySubject<any> = new ReplaySubject<any>(1);
  private destroyed$ = new Subject<void>();

  confirmarExclusao?: Usuario | null = null;

  @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;
  @ViewChild('inputWorkflow', { static: false }) inputWorkflow!: ElementRef<HTMLInputElement>;

  constructor(
    private usuarioService: UsuarioService,
    private usuarioWorkflowService: UsuarioWorkflowService
  ) {}

  ngOnInit(): void {
    this.carregarWorkflows();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 20,
      lengthChange: false,
      processing: true,
      searching: true,
      language: {
        search: "Pesquisar:",
        info: "Mostrando _START_ até _END_ de _TOTAL_ registros",
        paginate: { first: "Primeiro", last: "Último", next: "Próximo", previous: "Anterior" }
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

  carregarWorkflows(): void {
    this.usuarioWorkflowService.getUsuarios()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: wfs => {
          this.todasUsuariosWorkflow = wfs;
          this.usuariosWorkflow = wfs.slice(0, 5);
          this.carregarUsuarios();
        },
        error: err => console.error('Erro ao carregar workflows:', err)
      });
  }

  carregarUsuarios(): void {
    this.usuarioService.getUsuarios()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: usuarios => {
          this.usuarios = usuarios.map(u => {
            const wf = this.todasUsuariosWorkflow.find(w => w.id === u.usuarioWorkflowId);
            return { ...u, usuarioWorkflowNome: wf ? wf.nome : 'Não definido' };
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

  abrirDetalhes(usuario: Usuario): void {
    this.detalheSelecionado = usuario;
  }

  fecharDetalhes(): void {
    this.detalheSelecionado = undefined;
  }

  abrirEditar(usuario: Usuario): void {
    this.editarSelecionado = {
      id: usuario.id,
      userName: usuario.userName,
      email: usuario.email,
      usuarioWorkflowId: usuario.usuarioWorkflowId,
      usuarioWorkflowNome: usuario.usuarioWorkflowNome
    };
    this.showWorkflowDropdownEditar = false;
  }

  fecharEditar(): void {
    this.editarSelecionado = undefined;
    this.showWorkflowDropdownEditar = false;
  }

  buscarUsuariosWorkflow(query: string) {
    this.usuariosWorkflow = !query
      ? this.todasUsuariosWorkflow.slice(0, 5)
      : this.todasUsuariosWorkflow.filter(w => w.nome.toLowerCase().includes(query.toLowerCase()));
    this.showWorkflowDropdownEditar = true;
  }

  selecionarWorkflowEditar(workflow: UsuarioWorkflow) {
    if (!this.editarSelecionado) return;
    this.editarSelecionado.usuarioWorkflowId = workflow.id;
    this.editarSelecionado.usuarioWorkflowNome = workflow.nome;
    this.showWorkflowDropdownEditar = false;
  }

  getWorkflowNomeEditar(): string {
    if (!this.editarSelecionado?.usuarioWorkflowId) return '';
    const wf = this.todasUsuariosWorkflow.find(w => w.id === this.editarSelecionado?.usuarioWorkflowId);
    return wf ? wf.nome : (this.editarSelecionado.usuarioWorkflowNome ?? '');
  }

  salvarEdicao(): void {
  if (!this.editarSelecionado) return;

  const payload: any = {
    id: this.editarSelecionado.id,
    userName: this.editarSelecionado.userName ?? '',
    email: this.editarSelecionado.email ?? '',
    usuarioWorkflowId: this.editarSelecionado.usuarioWorkflowId ?? 0,
    password: this.editarSelecionado.password ?? undefined,
    confirmpassword: this.editarSelecionado.confirmpassword ?? undefined
  };

 
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

  this.usuarioService.atualizarUsuario(payload.id, payload).subscribe({
    next: () => {
      const index = this.usuarios.findIndex(u => u.id === this.editarSelecionado!.id);
      if (index !== -1) this.usuarios[index] = {
        ...this.usuarios[index],
        ...payload,
        usuarioWorkflowNome: this.editarSelecionado!.usuarioWorkflowNome
      };

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

  abrirModalDeletar(usuario: Usuario) {
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
    if (this.inputWorkflow) this.inputWorkflowWidth = this.inputWorkflow.nativeElement.offsetWidth;
  }
}
