import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AreaService } from '../../../services/area.service';
import { UsuarioWorkflowService } from '../../../services/usuario-workflow.service';

interface Usuario {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-criar-area',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './criar-area.html',
  styleUrls: ['./criar-area.scss']
})
export class CriarAreaComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  success = false;
  errorMsg = '';

  usuarios: Usuario[] = [];
  todosUsuarios: Usuario[] = [];
  showUsuariosDropdown = false;

  constructor(
    private fb: FormBuilder,
    private areaService: AreaService,
    private usuarioService: UsuarioWorkflowService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      descricao: ['', [Validators.required, Validators.minLength(5)]],
      responsavelId: [null] // adiciona o campo, mas sem obrigatoriedade
    });

    this.carregarUsuarios();
  }

  carregarUsuarios() {
    this.usuarioService.getUsuarios('').subscribe(res => {
      this.todosUsuarios = res;
      this.usuarios = res.slice(0, 5);
    });
  }

  buscarUsuarios(query: string) {
    if (!query) {
      this.usuarios = this.todosUsuarios.slice(0, 5);
    } else {
      this.usuarios = this.todosUsuarios.filter(u =>
        u.nome.toLowerCase().includes(query.toLowerCase())
      );
    }
    this.showUsuariosDropdown = true;
  }

  selecionarUsuario(usuario: Usuario) {
    this.form.get('responsavelId')?.setValue(usuario.id);
    this.showUsuariosDropdown = false;
  }

  getResponsavelNome(): string {
    const usuario = this.todosUsuarios.find(u => u.id === this.form.value.responsavelId);
    return usuario ? usuario.nome : '';
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
      descricao: this.form.value.descricao,
      responsavelAreaId: this.form.value.responsavelId || undefined // envia undefined se não tiver responsável
    };

    this.areaService.criarArea(payload).subscribe({
      next: () => {
        this.success = true;
        this.form.reset();
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error(err);
        this.errorMsg = 'Erro ao criar área';
        this.loading = false;
      }
    });
  }
}
