import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTablesModule, DataTableDirective } from 'angular-datatables';
import { Subject, takeUntil } from 'rxjs';

import { Programa } from '../../../models/Programa';
import { Area } from '../../../models/Area';
import { ProgramaService } from '../../../services/programa.service';
import { AreaService } from '../../../services/area.service';

@Component({
  selector: 'app-listar-programas',
  standalone: true,
  imports: [CommonModule, DataTablesModule, FormsModule],
  templateUrl: './listar-programas.html',
  styleUrls: ['./listar-programas.scss']
})
export class ListarProgramasComponent implements OnInit, OnDestroy {
  programas: Programa[] = [];
  detalheSelecionado?: Programa;
  editarSelecionado?: Programa;

  areas: Area[] = [];
  todasAreas: Area[] = [];
  showAreasDropdownEditar = false;
  inputAreaWidth = 0;

  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>(); 
  private destroyed$ = new Subject<void>();

  confirmarExclusao?: Programa | null = null;

  @ViewChild(DataTableDirective, { static: false }) dtElement!: DataTableDirective;
  @ViewChild('inputArea', { static: false }) inputArea!: ElementRef<HTMLInputElement>;

  constructor(
    private programaService: ProgramaService,
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
        this.carregarProgramas();
      });
  }

  carregarProgramas(): void {
    this.programaService.getProgramas()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (programas) => {
          this.programas = programas.map(p => {
            const area = this.todasAreas.find(a => a.id === p.areaId);
            return { ...p, areaNome: area ? area.nome : 'Não definida' };
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
        error: (err) => console.error('Erro ao carregar programas:', err)
      });
  }

  abrirDetalhes(programa: Programa): void {
    this.detalheSelecionado = programa;
  }

  fecharDetalhes(): void {
    this.detalheSelecionado = undefined;
  }

  abrirEditar(programa: Programa): void {
    this.editarSelecionado = { ...programa };
    this.showAreasDropdownEditar = false;
  }

  fecharEditar(): void {
    this.editarSelecionado = undefined;
    this.showAreasDropdownEditar = false;
  }

  buscarAreas(query: string) {
    if (!query) {
      this.areas = this.todasAreas.slice(0, 5);
    } else {
      this.areas = this.todasAreas.filter(a =>
        a.nome.toLowerCase().includes(query.toLowerCase())
      );
    }
    this.showAreasDropdownEditar = true;
  }

  selecionarAreaEditar(area: Area) {
    if (!this.editarSelecionado) return;
    this.editarSelecionado.areaId = area.id;
    this.editarSelecionado.areaNome = area.nome;
    this.showAreasDropdownEditar = false;
  }

getAreaNomeEditar(): string {
  const area = this.todasAreas.find(a => a.id === this.editarSelecionado?.areaId);
  return area ? area.nome : (this.editarSelecionado?.areaNome ?? '');
}


  salvarEdicao(): void {
    if (!this.editarSelecionado) return;

    const payload: Programa = {
      id: this.editarSelecionado.id,
      nome: this.editarSelecionado.nome,
      areaId: this.editarSelecionado.areaId,
      areaNome: this.editarSelecionado.areaNome
    };

    this.programaService.atualizarPrograma(this.editarSelecionado.id, payload)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          const index = this.programas.findIndex(p => p.id === this.editarSelecionado!.id);
          if (index !== -1) this.programas[index] = { ...this.editarSelecionado! };

          if (this.dtElement?.dtInstance) {
            this.dtElement.dtInstance.then((dtInstance: any) => {
              dtInstance.destroy();
              this.dtTrigger.next(null);
            });
          }

          this.fecharEditar();
        },
        error: (err) => console.error('Erro ao atualizar programa:', err)
      });
  }

  abrirModalDeletar(programa: Programa) {
    this.confirmarExclusao = programa;
  }

  cancelarExclusao() {
    this.confirmarExclusao = null;
  }

  confirmarDeletar() {
    if (!this.confirmarExclusao) return;

    const id = this.confirmarExclusao.id;
    this.programaService.deletarPrograma(id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.programas = this.programas.filter(p => p.id !== id);
          this.confirmarExclusao = null;
        },
        error: (err) => console.error('Erro ao deletar programa:', err)
      });
  }

  onWindowResize() {
    if (this.inputArea) {
      this.inputAreaWidth = this.inputArea.nativeElement.offsetWidth;
    }
  }
}
