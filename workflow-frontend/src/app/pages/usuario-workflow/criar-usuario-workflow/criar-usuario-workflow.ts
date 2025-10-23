import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UsuarioWorkflowService } from '../../../services/usuario-workflow.service';
import { AreaService } from '../../../services/area.service';

interface Area {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-criar-usuario-workflow',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './criar-usuario-workflow.html',
  styleUrls: ['./criar-usuario-workflow.scss']
})
export class CriarUsuarioWorkflowComponent {
  form!: FormGroup;
  loading = false;
  success = false;
  errorMsg = '';

  areas: Area[] = [];
  todasAreas: Area[] = [];
  showAreasDropdown = false;

  constructor(
    private fb: FormBuilder,
    private usuarioWorkflowService: UsuarioWorkflowService,
    private areaService: AreaService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      areaId: ['', Validators.required]
    });

    this.carregarAreas();
  }

  // === Áreas ===
  carregarAreas() {
    this.areaService.getAreas().subscribe(res => {
      this.todasAreas = res;
      this.areas = res.slice(0, 5);
    });
  }

  buscarAreas(query: string) {
    if (!query) {
      this.areas = this.todasAreas.slice(0, 5);
    } else {
      this.areas = this.todasAreas.filter(a =>
        a.nome.toLowerCase().includes(query.toLowerCase())
      );
    }
    this.showAreasDropdown = true;
  }

  selecionarArea(area: Area) {
    this.form.patchValue({ areaId: area.id });
    const input = document.getElementById('areaInput') as HTMLInputElement;
    if (input) input.value = area.nome;
    this.showAreasDropdown = false;
  }

  getAreaNome(): string {
    const area = this.todasAreas.find(a => a.id === this.form.value.areaId);
    return area ? area.nome : '';
  }

  // === Envio ===
  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.success = false;
    this.errorMsg = '';

    const payload = {
      id: 0, // or null, depending on backend expectations
      nome: this.form.value.nome,
      areaId: this.form.value.areaId
    };

    this.usuarioWorkflowService.criarUsuario(payload).subscribe({
      next: () => {
        this.success = true;
        this.form.reset();
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.errorMsg = 'Erro ao criar usuário.';
        this.loading = false;
      }
    });
  }
}
