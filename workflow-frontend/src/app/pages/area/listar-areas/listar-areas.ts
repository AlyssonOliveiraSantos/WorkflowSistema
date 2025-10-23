import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTablesModule, DataTableDirective } from 'angular-datatables';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';

import { Area } from '../../../models/Area';
import { AreaService } from '../../../services/area.service';
import { UsuarioWorkflowService } from '../../../services/usuario-workflow.service';

interface Usuario {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-listar-areas',
  standalone: true,
  imports: [CommonModule, DataTablesModule, FormsModule],
  templateUrl: './listar-areas.html',
  styleUrls: ['./listar-areas.scss']
})
export class ListarAreasComponent implements OnInit, OnDestroy {
  areas: Area[] = [];
  detalheSelecionado?: Area;
  editarSelecionado?: Area;

  usuarios: Usuario[] = [];       
  todosUsuarios: Usuario[] = [];  
  showUsuariosDropdownEditar = false;
  inputUsuarioWidth = 0;

  dtOptions: any = {};
  dtTrigger: ReplaySubject<any> = new ReplaySubject<any>(1);
  private destroyed$ = new Subject<void>();

  confirmarExclusao?: Area | null = null;

  @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;
  @ViewChild('inputUsuario', { static: false }) inputUsuario!: ElementRef<HTMLInputElement>;

  constructor(
    private areaService: AreaService,
    private usuarioService: UsuarioWorkflowService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios(); 
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

    this.carregarAreas();
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }


  carregarAreas(): void {
    this.areaService.getAreas()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (areas) => {
          this.areas = areas.map(a => {
            const usuario = this.todosUsuarios.find(u => u.id === a.responsavelAreaId);
            return {
              ...a,
              responsavelAreaNome: usuario ? usuario.nome : 'Não definido'
            };
          });

          if (this.dtElement?.dtInstance) {
            this.dtElement.dtInstance.then((dtInstance: any) => {
              dtInstance.destroy();
              this.dtTrigger.next(null);
            });
          } else {
            this.dtTrigger.next(null);
          }
        },
        error: (err) => console.error('Erro ao buscar áreas:', err)
      });
  }

 
  carregarUsuarios() {
    this.usuarioService.getUsuarios('').subscribe(res => {
      this.todosUsuarios = res;           
      this.usuarios = res.slice(0, 5);   
    });
  }

 
  abrirDetalhes(area: Area): void {
    this.detalheSelecionado = area;
  }

  fecharDetalhes(): void {
    this.detalheSelecionado = undefined;
  }

  
  abrirEditar(area: Area): void {
    this.editarSelecionado = { ...area };
    this.showUsuariosDropdownEditar = false;
  }

  fecharEditar(): void {
    this.editarSelecionado = undefined;
    this.showUsuariosDropdownEditar = false;
  }


  buscarUsuarios(query: string) {
    if (!query) {
      this.usuarios = this.todosUsuarios.slice(0, 5);
    } else {
      this.usuarios = this.todosUsuarios.filter(u =>
        u.nome.toLowerCase().includes(query.toLowerCase())
      );
    }
    this.showUsuariosDropdownEditar = true;
  }


  selecionarUsuarioEditar(usuario: Usuario) {
    if (!this.editarSelecionado) return;
    this.editarSelecionado.responsavelAreaId = usuario.id;
    this.editarSelecionado.responsavelAreaNome = usuario.nome;
    this.showUsuariosDropdownEditar = false;
  }

  getUsuarioNomeEditar(): string {
    if (!this.editarSelecionado?.responsavelAreaId) return '';
    const usuario = this.todosUsuarios.find(u => u.id === this.editarSelecionado?.responsavelAreaId);
    return usuario ? usuario.nome : (this.editarSelecionado.responsavelAreaNome ?? '');
  }


  salvarEdicao(): void {
    if (!this.editarSelecionado) return;

    const payload: Area = {
      id: this.editarSelecionado.id,
      nome: this.editarSelecionado.nome,
      descricao: this.editarSelecionado.descricao,
      responsavelAreaId: this.editarSelecionado.responsavelAreaId,
      responsavelAreaNome: this.editarSelecionado.responsavelAreaNome
    };

    this.areaService.atualizarArea(this.editarSelecionado.id, payload)
      .subscribe({
        next: () => {
          const index = this.areas.findIndex(a => a.id === this.editarSelecionado!.id);
          if (index !== -1) {
            this.areas[index] = { ...this.editarSelecionado! };
          }

          if (this.dtElement?.dtInstance) {
            this.dtElement.dtInstance.then((dtInstance: any) => {
              dtInstance.destroy();
              this.dtTrigger.next(null);
            });
          }

          this.fecharEditar();
        },
        error: err => console.error('Erro ao atualizar área:', err)
      });
  }


  abrirModalDeletar(area: Area) {
    this.confirmarExclusao = area;
  }

  cancelarExclusao() {
    this.confirmarExclusao = null;
  }

  confirmarDeletar() {
    if (!this.confirmarExclusao) return;

    const id = this.confirmarExclusao.id;
    this.areaService.deletarArea(id).subscribe({
      next: () => {
        this.areas = this.areas.filter(a => a.id !== id);
        this.confirmarExclusao = null;
      },
      error: (err) => console.error('Erro ao deletar área:', err)
    });
  }

  onWindowResize() {
    if (this.inputUsuario) {
      this.inputUsuarioWidth = this.inputUsuario.nativeElement.offsetWidth;
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}
