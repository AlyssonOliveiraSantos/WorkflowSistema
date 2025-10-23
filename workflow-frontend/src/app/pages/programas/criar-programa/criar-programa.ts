import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ProgramaService } from '../../../services/programa.service';
import { AreaService } from '../../../services/area.service';
import { Area } from '../../../models/Area';

@Component({
  selector: 'app-criar-programa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './criar-programa.html',
  styleUrls: ['./criar-programa.scss']
})
export class CriarProgramaComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  success = false;
  errorMsg = '';

  areas: Area[] = [];
  todosAreas: Area[] = [];
  showAreasDropdown = false;

  constructor(
    private fb: FormBuilder,
    private programaService: ProgramaService,
    private areaService: AreaService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      areaId: [null] // opcional
    });

    this.carregarAreas();
  }

  carregarAreas(): void {
    this.areaService.getAreas().subscribe({
      next: (res) => {
        this.todosAreas = res || [];
        this.areas = this.todosAreas.slice(0, 5);
      },
      error: (err) => {
        console.error('Erro ao carregar áreas', err);
        this.todosAreas = [];
        this.areas = [];
      }
    });
  }

  buscarAreas(query: string) {
    if (!query) {
      this.areas = this.todosAreas.slice(0, 5);
    } else {
      this.areas = this.todosAreas.filter(a =>
        a.nome.toLowerCase().includes(query.toLowerCase())
      );
    }
    this.showAreasDropdown = true;
  }

  selecionarArea(area: Area) {
    this.form.get('areaId')?.setValue(area.id);
    this.showAreasDropdown = false;
  }

  getAreaNome(): string {
    if (!this.form || !this.todosAreas.length) return '';
    const area = this.todosAreas.find(a => a.id === this.form.value.areaId);
    return area ? area.nome : '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.errorMsg = 'Preencha todos os campos obrigatórios';
      return;
    }

    this.loading = true;
    this.success = false;
    this.errorMsg = '';

    const payload = {
      nome: this.form.value.nome,
      areaId: this.form.value.areaId || undefined
    };

    this.programaService.criarPrograma(payload).subscribe({
      next: () => {
        this.success = true;
        this.form.reset();
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error(err);
        this.errorMsg = 'Erro ao criar programa';
        this.loading = false;
      }
    });
  }
}
